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
  VStack,
  ButtonGroup,
} from '@chakra-ui/react'
import { 
  MODAL_SIZE, 
  MODAL_PADDING_X, 
  MODAL_PADDING_BOTTOM,
  MODAL_PADDING_TOP 
} from '../../constants/app-constants'
import { FormData, FormHandlers, FormValidation } from '../../types/staff'

interface AddStaffModalProps extends FormData, FormHandlers, FormValidation {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function AddStaffModal({
  isOpen,
  onClose,
  onSubmit,
  newName,
  newTitle,
  nameError,
  titleError,
  onNameChange,
  onTitleChange,
  onKeyDown,
}: AddStaffModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      size={MODAL_SIZE}
    >
      <ModalOverlay />
      <ModalContent 
        data-testid="modal-content" 
        onKeyDown={onKeyDown} 
        px={MODAL_PADDING_X} 
        pb={MODAL_PADDING_BOTTOM}
      >
        <ModalHeader pt={MODAL_PADDING_TOP}>Add New Staff Member</ModalHeader>
        <ModalBody>
          <VStack spacing={8} align="stretch">
            <FormControl isInvalid={!!nameError}>
              <FormLabel>Name</FormLabel>
              <Input
                data-testid="name-input"
                value={newName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Enter staff member's name"
                size="lg"
              />
              <FormErrorMessage data-testid="name-error">{nameError}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!titleError}>
              <FormLabel>Job Title</FormLabel>
              <Input
                data-testid="title-input"
                value={newTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Enter job title"
                size="lg"
              />
              <FormErrorMessage data-testid="title-error">{titleError}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <ButtonGroup spacing={6}>
            <Button size="lg" variant="ghost" onClick={onClose} data-testid="cancel-button">
              Never Mind
            </Button>
            <Button size="lg" colorScheme="primary" onClick={onSubmit} data-testid="submit-button">
              Pogo It Up!
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 