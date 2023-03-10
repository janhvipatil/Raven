import { Text, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, HStack, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react"
import { useContext } from "react"
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi"
import { ChannelContext } from "../../../utils/channel/ChannelProvider"
import { ChannelDetails } from "../channel-details/ChannelDetails"
import { ChannelMemberDetails } from "../channel-details/ChannelMemberDetails"

interface ViewChannelDetailsModalProps {
    isOpen: boolean,
    onClose: () => void
}

export const ViewChannelDetailsModal = ({ isOpen, onClose }: ViewChannelDetailsModalProps) => {

    const { channelMembers, channelData } = useContext(ChannelContext)
    const members = Object.values(channelMembers)
    const memberCount = members.length

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <ModalOverlay />
            <ModalContent>

                <ModalHeader>
                    {channelData?.type === 'Public' && <HStack><BiHash /><Text>{channelData?.channel_name}</Text></HStack> ||
                        channelData?.type === 'Private' && <HStack><BiLockAlt /><Text>{channelData?.channel_name}</Text></HStack> ||
                        channelData?.type === 'Open' && <HStack><BiGlobe /><Text>{channelData?.channel_name}</Text></HStack>
                    }
                </ModalHeader>
                <ModalCloseButton mt='2' />

                <ModalBody>

                    <Tabs h='60vh' defaultIndex={1}>
                        <TabList>
                            <Tab>About</Tab>
                            <Tab>
                                <HStack>
                                    <Text>Members</Text>
                                    <Text>{memberCount}</Text>
                                </HStack>
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel px={0}>
                                <ChannelDetails />
                            </TabPanel>
                            <TabPanel px={0}>
                                <ChannelMemberDetails members={members} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                    <Text fontSize='xs' color='gray.500' pl='3' pb='4'>Channel ID: {channelData?.name}</Text>

                </ModalBody>

            </ModalContent>
        </Modal>
    )
}