import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react'
import { FormData, FormHandlers, FormValidation } from '../../types/staff'
import { MODAL_SIZE, MODAL_PADDING_X, MODAL_PADDING_BOTTOM, MODAL_PADDING_TOP } from '../../constants/app-constants'

interface EditStaffModalProps extends FormData, FormHandlers, FormValidation {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export function EditStaffModal({
  isOpen,
  onClose,
  onSubmit,
  newName,
  newTitle,
  nameError,
  titleError,
  onNameChange,
  onTitleChange,
}: EditStaffModalProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Enter' && !e.repeat) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      closeOnOverlayClick={false}
      size={MODAL_SIZE}
    >
      <ModalOverlay />
      <ModalContent 
        data-testid="edit-modal-content"
        px={MODAL_PADDING_X} 
        pb={MODAL_PADDING_BOTTOM}
        onKeyDown={handleKeyDown}
      >
        <ModalHeader pt={MODAL_PADDING_TOP}>Edit Staff Member</ModalHeader>
        <ModalBody>
          <FormControl isInvalid={!!nameError} mb={4}>
            <FormLabel>Name</FormLabel>
            <Input
              data-testid="edit-name-input"
              value={newName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter staff member's name"
              size="lg"
            />
            <FormErrorMessage data-testid="edit-name-error">{nameError}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!titleError}>
            <FormLabel>Job Title</FormLabel>
            <Input
              data-testid="edit-title-input"
              value={newTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter job title"
              size="lg"
            />
            <FormErrorMessage data-testid="edit-title-error">{titleError}</FormErrorMessage>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} data-testid="edit-cancel-button" size="lg">
            Cancel
          </Button>
          <Button colorScheme="primary" onClick={onSubmit} data-testid="edit-submit-button" size="lg">
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 