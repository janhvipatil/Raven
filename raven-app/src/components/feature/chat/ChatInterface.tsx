import { Avatar, AvatarBadge, Box, Button, HStack, Stack, Text, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { useFrappeCreateDoc, useFrappeGetCall } from "frappe-react-sdk"
import { useContext } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { ChannelData } from "../../../types/Channel/Channel"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { UserDataContext } from "../../../utils/user/UserDataProvider"
import { AlertBanner } from "../../layout/AlertBanner"
import { PageHeader } from "../../layout/Heading/PageHeader"
import { PageHeading } from "../../layout/Heading/PageHeading"
import { FullPageLoader } from "../../layout/Loaders"
import { AddChannelMemberModal } from "../channels/AddChannelMemberModal"
import { ViewChannelDetailsModal } from "../channels/ViewChannelDetailsModal"
import { ViewOrAddMembersButton } from "../view-or-add-members/ViewOrAddMembersButton"
import { ChatHistory } from "./ChatHistory"
import { ChatInput } from "./ChatInput"

export const ChatInterface = () => {

    const { channelData, channelMembers } = useContext(ChannelContext)
    const userData = useContext(UserDataContext)
    const user = userData?.name
    const peer = Object.keys(channelMembers).filter((member) => member !== user)[0]
    const { data: channelList, error: channelListError } = useFrappeGetCall<{ message: ChannelData[] }>("raven.raven_channel_management.doctype.raven_channel.raven_channel.get_channel_list")

    const { colorMode } = useColorMode()

    const allMembers = Object.values(channelMembers).map((member) => {
        return {
            id: member.name,
            value: member.full_name
        }
    })

    const allChannels = channelList?.message.map((channel) => {
        return {
            id: channel.name,
            value: channel.channel_name
        }
    })


    const { isOpen: isViewDetailsModalOpen, onOpen: onViewDetailsModalOpen, onClose: onViewDetailsModalClose } = useDisclosure()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { createDoc, error: joinError } = useFrappeCreateDoc()
    const toast = useToast()

    const joinChannel = () => {
        return createDoc('Raven Channel Member', {
            channel_id: channelData?.name,
            user_id: user
        }).then(() => {
            toast({
                title: 'Channel joined successfully',
                status: 'success',
                duration: 1000,
                position: 'bottom',
                variant: 'solid',
                isClosable: true
            })
        })
            .catch((e) => {
                toast({
                    title: 'Error: could not join channel.',
                    status: 'error',
                    duration: 3000,
                    position: 'bottom',
                    variant: 'solid',
                    isClosable: true,
                    description: `${e.message}`
                })
            })
    }

    if (allChannels && allMembers) return (
        <>
            <PageHeader>
                {channelData && user &&
                    <PageHeading>
                        <HStack>
                            {channelData.is_direct_message == 1
                                ?
                                (channelData.is_self_message == 0 ?
                                    <HStack>
                                        <Avatar name={channelMembers?.[peer]?.full_name} src={channelMembers?.[peer]?.user_image} borderRadius={'lg'} size="sm" />
                                        <Text>{channelMembers?.[peer]?.full_name}</Text>
                                    </HStack> :
                                    <HStack>
                                        <Avatar name={channelMembers?.[user]?.full_name} src={channelMembers?.[user]?.user_image} borderRadius={'lg'} size="sm">
                                            <AvatarBadge boxSize='0.88em' bg='green.500' />
                                        </Avatar>
                                        <Text>{channelMembers?.[user]?.full_name}</Text><Text fontSize='sm' color='gray.500'>(You)</Text>
                                    </HStack>) :
                                (channelData?.type === 'Private' &&
                                    <HStack><BiLockAlt /><Text>{channelData?.channel_name}</Text></HStack> ||
                                    channelData?.type === 'Public' &&
                                    <HStack><BiHash /><Text>{channelData?.channel_name}</Text></HStack> ||
                                    channelData?.type === 'Open' &&
                                    <HStack><BiGlobe /><Text>{channelData?.channel_name}</Text></HStack>
                                )}
                        </HStack>
                    </PageHeading>
                }
                {channelData?.is_direct_message == 0 &&
                    <ViewOrAddMembersButton onClickViewMembers={onViewDetailsModalOpen} onClickAddMembers={onOpen} />}
            </PageHeader>
            <Stack h='calc(100vh - 54px)' justify={'flex-end'} p={4} overflow='hidden' mt='16'>
                {channelData &&
                    <ChatHistory channelName={channelData.name} />
                }
                {(user && user in channelMembers) || channelData?.type === 'Open' ?
                    <ChatInput channelID={channelData?.name ?? ''} allChannels={allChannels} allMembers={allMembers} /> :
                    <Box border='1px' borderColor={'gray.500'} rounded='lg' bottom='2' boxShadow='base' position='fixed' w='calc(98vw - var(--sidebar-width))' bg={colorMode === "light" ? "white" : "gray.800"} p={4}>
                        <HStack justify='center' align='center' pb={4}><BiHash /><Text>{channelData?.channel_name}</Text></HStack>
                        <HStack justify='center' align='center' spacing={4}><Button colorScheme='blue' variant='outline' size='sm' onClick={onViewDetailsModalOpen}>Details</Button><Button colorScheme='blue' variant='solid' size='sm' onClick={joinChannel}>Join Channel</Button></HStack></Box>}
            </Stack>
            <ViewChannelDetailsModal isOpen={isViewDetailsModalOpen} onClose={onViewDetailsModalClose} />
            <AddChannelMemberModal isOpen={isOpen} onClose={onClose} />
        </>
    )

    else if (channelListError) return (
        <Box p={4}>
            <AlertBanner status='error' heading={channelListError.message}>{channelListError.httpStatus}: {channelListError.httpStatusText}</AlertBanner>
        </Box>
    )

    else return (
        <FullPageLoader />
    )
}