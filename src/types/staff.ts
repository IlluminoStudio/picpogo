export interface StaffMember {
  id: string
  imageUrl: string
  userName: string
  jobTitle: string
}

export interface FormValidation {
  nameError: string
  titleError: string
}

export interface FormData {
  newName: string
  newTitle: string
}

export interface FormHandlers {
  onNameChange: (value: string) => void
  onTitleChange: (value: string) => void
} 