import {
  Box,
  Image,
  Text,
  IconButton,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { StaffMember } from '../types/staff'

interface StaffCardProps {
  member: StaffMember
  onImageClick: (image: string) => void
  onEditClick: (member: StaffMember) => void
  onDelete: (id: string) => void
}

export function StaffCard({
  member,
  onImageClick,
  onEditClick,
  onDelete,
}: StaffCardProps) {
  const imageHeight = useBreakpointValue({ base: "150px", md: "250px" })
  const titleFontSize = useBreakpointValue({ base: "md", md: "xl" })
  const padding = useBreakpointValue({ base: 3, md: 4 })
  const iconSize = useBreakpointValue({ base: "sm", md: "md" })

  return (
    <Box
      data-testid="staff-card"
      bg="neutral.000"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      position="relative"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)' }}
    >
      <Image
        src={member.imageUrl}
        alt={member.userName}
        w="full"
        h={imageHeight}
        objectFit="cover"
        cursor="pointer"
        onClick={() => onImageClick(member.imageUrl)}
        data-testid="staff-photo"
        onError={(e) => {
          e.currentTarget.src = '/mona.jpeg';
        }}
      />
      
      <Box p={padding}>
        <Flex justify="space-between" align="start">
          <Box flex="1">
            <Text
              fontSize={titleFontSize}
              fontWeight="bold"
              color="neutral.900"
              data-testid="staff-name"
            >
              {member.userName}
            </Text>
            <Text
              fontSize={{ base: "xs", md: "md" }}
              color="neutral.700"
              data-testid="staff-title"
            >
              {member.jobTitle}
            </Text>
          </Box>
          
          <Flex gap={2}>
            <IconButton
              aria-label="Edit staff member"
              icon={<EditIcon />}
              size={iconSize}
              fontSize={{ base: "0.9em", md: "1.1em" }}
              variant="ghost"
              color="neutral.700"
              _hover={{ color: "blue.500" }}
              onClick={() => onEditClick(member)}
              data-testid="edit-staff-button"
            />
            <IconButton
              aria-label="Delete staff member"
              icon={<DeleteIcon />}
              size={iconSize}
              fontSize={{ base: "0.9em", md: "1.1em" }}
              variant="ghost"
              color="neutral.700"
              _hover={{ color: "red.500" }}
              onClick={() => onDelete(member.id)}
              data-testid="delete-staff-button"
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
} 