import {
  Modal,
  ModalOverlay,
  ModalContent,
  Image,
} from '@chakra-ui/react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string | null
}

export function ImageModal({
  isOpen,
  onClose,
  imageSrc,
}: ImageModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="xl"
      closeOnEsc={true}
      closeOnOverlayClick={true}
    >
      <ModalOverlay />
      <ModalContent data-testid="image-modal">
        <Image
          src={imageSrc || ''}
          alt="Full size staff photo"
          maxH="90vh"
          objectFit="contain"
          data-testid="modal-image"
        />
      </ModalContent>
    </Modal>
  )
} 