import { Box, Button, ButtonGroup, HStack, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Popover, PopoverContent, PopoverTrigger, Stack, StackDivider, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { useFrappeUpdateDoc } from "frappe-react-sdk"
import { useCallback, useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { FaRegSmile } from "react-icons/fa"
import ReactQuill from "react-quill"
import { AlertBanner } from "../../layout/AlertBanner"

interface EditMessageModalProps {
    isOpen: boolean,
    onClose: (refresh?: boolean) => void,
    channelMessageID: string,
    allMembers: { id: string; value: string; }[],
    allChannels: { id: string; value: string; }[],
    originalText: string
}

export const EditMessageModal = ({ isOpen, onClose, channelMessageID, allMembers, allChannels, originalText }: EditMessageModalProps) => {

    const toast = useToast()
    const { updateDoc, error, loading, reset } = useFrappeUpdateDoc()

    useEffect(() => {
        reset()
    }, [isOpen, reset])

    const [text, setText] = useState(originalText)

    const handleChange = (value: string) => {
        setText(value)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSubmit();
        }
    }

    useHotkeys('enter', () => onSubmit(), {
        enabled: true,
        preventDefault: true,
        enableOnFormTags: true,
    })

    const onSubmit = () => {
        updateDoc('Raven Message', channelMessageID,
            { text: text }).then(() => {
                onClose(true)
                toast({
                    title: "Message updated",
                    description: "Your message has been updated",
                    status: "success",
                    duration: 3000,
                    isClosable: true
                })
            }).catch((e) => {
                toast({
                    title: "Error",
                    description: e.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true
                })
            })
    }

    const handleClose = (refresh: boolean = false) => {
        reset()
        onClose(refresh)
    }

    const mention = {
        allowedChars: /^[A-Za-z\s????????????]*$/,
        mentionDenotationChars: ["@", "#"],
        source: useCallback((searchTerm: string, renderList: any, mentionChar: string) => {

            let values;

            if (mentionChar === "@") {
                values = allMembers;
            } else {
                values = allChannels;
            }

            if (searchTerm.length === 0) {
                renderList(values, searchTerm);
            } else {
                const matches = [];
                if (values)
                    for (let i = 0; i < values.length; i++)
                        if (
                            ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                        )
                            matches.push(values[i]);
                renderList(matches, searchTerm);
            }
        }, [])
    }

    const formats = [
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'mention',
        'code-block'
    ]

    const { colorMode } = useColorMode()

    const { isOpen: showEmojiPicker, onToggle: onEmojiPickerToggle, onClose: onEmojiPickerClose } = useDisclosure()

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        setText(text + emojiObject.emoji)
        onEmojiPickerClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Message</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <Box>
                        {error && <AlertBanner status='error' heading={error.message}>{error.httpStatus} - {error.httpStatusText}</AlertBanner>}
                        <Stack border='1px' borderColor={'gray.500'} rounded='lg' maxH='40vh' boxShadow='base' bg={colorMode === "light" ? "white" : "gray.800"}>
                            <ReactQuill
                                className={colorMode === 'light' ? 'my-quill-editor light-theme' : 'my-quill-editor dark-theme'}
                                onChange={handleChange}
                                value={text}
                                modules={{
                                    toolbar: [
                                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'code-block']
                                    ],
                                    mention
                                }}
                                formats={formats}
                                onKeyDown={handleKeyDown} />
                            <HStack w='full' justify={'space-between'} px='2' pb='2'>
                                <Box>
                                    <Popover
                                        isOpen={showEmojiPicker}
                                        onClose={onEmojiPickerClose}
                                        placement='top-end'
                                        isLazy
                                        lazyBehavior="unmount"
                                        gutter={48}
                                        closeOnBlur={false}>
                                        <PopoverTrigger>
                                            <IconButton size='xs' variant='ghost' aria-label={"pick emoji"} icon={<FaRegSmile fontSize='1.0rem' />} onClick={onEmojiPickerToggle} />
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <EmojiPicker onEmojiClick={onEmojiClick} lazyLoadEmojis />
                                        </PopoverContent>
                                    </Popover>
                                </Box>
                            </HStack>
                        </Stack>
                    </Box>

                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <Button variant='ghost' onClick={() => handleClose()} isDisabled={loading}>Cancel</Button>
                        <Button colorScheme='blue' type='submit' isLoading={loading} onClick={onSubmit}>Update</Button>
                    </ButtonGroup>
                </ModalFooter>

            </ModalContent>
        </Modal>
    )
}