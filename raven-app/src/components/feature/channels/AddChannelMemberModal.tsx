import { Button, ButtonGroup, chakra, FormControl, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { BiHash, BiLockAlt } from 'react-icons/bi'
import { AddMembersDropdown } from '../select-member/AddMembersDropdown'
import { ChakraStylesConfig } from "chakra-react-select"
import { fallbackPfp, pfp, MemberOption } from "../select-member/AddMembersDropdown"

interface AddChannelMemberModalProps {
  isOpen: boolean,
  onClose: () => void,
  channel_name: string,
  type: string,
  channel_id: string
}

interface FormProps {
  add_members: string[] | null
}

export const AddChannelMemberModal = ({ isOpen, onClose, channel_name, type, channel_id }: AddChannelMemberModalProps) => {

  const methods = useForm<FormProps>({
    defaultValues: {
      add_members: null
    }
  })

  const { handleSubmit, reset } = methods

  useEffect(() => {
    reset()
  }, [isOpen, reset])

  const members = methods.watch('add_members')

  const onSubmit = (data: FormProps) => {
    console.log(data, members)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>

      <ModalOverlay />
      <ModalContent>

        <ModalHeader>
          <HStack>
            <Text>Add members to </Text>
            {type === 'Public'
              ?
              <Text><BiHash /> {channel_name}</Text>
              :
              <Text><BiLockAlt /> {channel_name}</Text>}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <FormProvider {...methods}>
          <chakra.form onSubmit={handleSubmit(onSubmit)}>

            <ModalBody>
              <FormControl>
                <AddMembersDropdown autoFocus name="add_members" chakraStyles={customStyles} />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <ButtonGroup>
                <Button variant='ghost' onClick={onClose}>Cancel</Button>
                <Button colorScheme='blue' type='submit'>Save</Button>
              </ButtonGroup>
            </ModalFooter>

          </chakra.form>
        </FormProvider>

      </ModalContent>
    </Modal>
  )
}

const customStyles: ChakraStylesConfig<MemberOption> = {
  control: (chakraStyles) => ({ ...chakraStyles, backgroundColor: 'white', width: '100%', fontSize: 'sm' }),
  menu: (chakraStyles) => ({ ...chakraStyles, borderRadius: 'md', width: '100%', borderWidth: '1px' }),
  option: (chakraStyles, { isSelected, data }) => ({
    ...chakraStyles, ...((data.image && { ...pfp(data.image) }) || { ...fallbackPfp(data.label) }), width: '100%', fontSize: 'sm', ...(isSelected && {
      backgroundColor: "#E2E8F0",
      color: "black",
    })
  }),
  noOptionsMessage: (chakraStyles) => ({ ...chakraStyles, width: '100%', fontSize: 'sm' })
}