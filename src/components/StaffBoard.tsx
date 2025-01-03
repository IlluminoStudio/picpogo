"use client";

import {
  Box,
  Container,
  Grid,
  Image,
  Text,
  IconButton,
  Flex,
  Button,
  useToast,
  useDisclosure,
  Tooltip,
  Spinner,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, EditIcon, LinkIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import {
  STAFF_STORAGE_KEY,
  ITEMS_PER_PAGE,
  DEFAULT_IMAGE,
  PORTRAIT_HEIGHT,
  PORTRAIT_WIDTH,
  BACKGROUND_IMAGE,
  LOGO_IMAGE,
  PEXELS_LOGO,
  PEXELS_URL,
  TOAST_DURATION,
} from "../constants/app-constants";
import { useSearchParams } from "next/navigation";
import { AddStaffModal } from "./modals/AddStaffModal";
import { EditStaffModal } from "./modals/EditStaffModal";
import { ImageModal } from "./modals/ImageModal";
import { usePagination } from "../hooks/usePagination";
import { useUrlParams } from "../hooks/useUrlParams";
import { useQuery, gql } from "@apollo/client";
import { StaffMember } from "../types/staff";

const GET_IMAGE = gql`
  query GetImage($query: String!) {
    photos(query: $query)
      @rest(
        type: "SearchResult"
        path: "search?query={args.query}&per_page=1"
        method: "GET"
      ) {
      photos {
        id
        src {
          portrait
        }
      }
    }
  }
`;

export default function StaffBoard() {
  // Search params
  const searchParams = useSearchParams();

  // State for client-side rendering
  const [isClient, setIsClient] = useState(false);

  // States
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [nameError, setNameError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const { data: imageData, loading: imageLoading } = useQuery(GET_IMAGE, {
    variables: { query: currentQuery },
    skip: !currentQuery,
  });

  // Effect to handle API response
  useEffect(() => {
    if (imageData?.photos?.photos?.[0]) {
      const originalImageUrl = imageData.photos.photos[0].src.portrait;
      // Modify the image URL to use fixed dimensions
      const imageUrl = originalImageUrl.replace(
        /h=\d+&w=\d+/,
        `h=${PORTRAIT_HEIGHT}&w=${PORTRAIT_WIDTH}`
      );
      addNewStaffMember(imageUrl);
    } else if (currentQuery && !imageLoading) {
      // Use default image to indicate API error
      addNewStaffMember(DEFAULT_IMAGE);
    }
  }, [imageData, currentQuery, imageLoading]);

  const addNewStaffMember = (imageUrl: string) => {
    const newStaff: StaffMember = {
      id: `${Date.now()}-${staffMembers.length + 1}`, // reduce ID collisions
      imageUrl,
      userName: newName,
      jobTitle: newTitle,
    };

    setStaffMembers([...staffMembers, newStaff]);
    showToast("✨ Welcome aboard!", `${newName} has joined the team!`);
    handleAddClose();
    setCurrentQuery(""); // Reset the query after successful addition
  };

  // Pagination
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage,
    canGoToPreviousPage,
  } = usePagination({
    totalItems: staffMembers.length,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  // Sync to localStorage
  useEffect(() => {
    if (staffMembers.length > 0) {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffMembers));
    }
  }, [staffMembers]);

  // Hooks
  const toast = useToast();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const { getShareableUrl } = useUrlParams();

  // Validation
  const validateInput = (input: string, field: "name" | "title") => {
    if (!input.trim()) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    if (!/^[a-zA-Z\s\-'.]{2,50}$/.test(input)) {
      return `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } can only contain letters, spaces, hyphens, and apostrophes (2-50 characters)`;
    }
    return "";
  };

  // Modal keydown handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleAddClose();
    } else if (e.key === "Enter" && !e.repeat) {
      e.preventDefault();
      handleAddStaff();
    }
  };

  // Toast helper
  const showToast = (title: string, description: string) => {
    toast({
      title,
      description,
      duration: TOAST_DURATION,
      isClosable: true,
      position: "top",
      status: "success",
    });
  };

  // Validate then submit form
  const handleFormSubmit = (
    onSuccess: (name: string, title: string) => void
  ) => {
    const nameValidation = validateInput(newName, "name");
    const titleValidation = validateInput(newTitle, "title");

    setNameError(nameValidation);
    setTitleError(titleValidation);

    if (!nameValidation && !titleValidation) {
      onSuccess(newName.trim(), newTitle.trim());
    }
  };

  const handleAddStaff = () => {
    handleFormSubmit((name, title) => {
      // add 'professional' to increase search relevance
      const searchTerms = `professional ${title}`.split(" ").filter(Boolean);
      const encodedQuery = encodeURIComponent(searchTerms.join(" "));
      setCurrentQuery(encodedQuery);
    });
  };

  // Base handler for common form reset logic
  const handleModalClose = () => {
    setNewName("");
    setNewTitle("");
    setNameError("");
    setTitleError("");
  };

  // Specific handler for add modal
  const handleAddClose = () => {
    handleModalClose();
    onAddClose();
  };

  // Specific handler for edit modal
  const handleEditClose = () => {
    handleModalClose();
    setEditingStaff(null);
    onEditClose();
  };

  const handleDelete = (id: string) => {
    const staffMember = staffMembers.find((member) => member.id === id);
    const newStaffList = staffMembers.filter((member) => member.id !== id);
    setStaffMembers(newStaffList);

    // Clear localStorage if this was the last staff member
    if (newStaffList.length === 0) {
      localStorage.removeItem(STAFF_STORAGE_KEY);
    }

    // Pagination label update
    const newTotalPages = Math.ceil(newStaffList.length / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages) {
      goToPage(Math.max(1, newTotalPages));
    }

    showToast(
      "👋 See you later!",
      `${staffMember?.userName} has moved on to new adventures`
    );
  };

  const handleEditClick = (member: StaffMember) => {
    setEditingStaff(member);
    setNewName(member.userName);
    setNewTitle(member.jobTitle);
    onEditOpen();
  };

  const handleEditSubmit = () => {
    if (!editingStaff) return;

    handleFormSubmit((name, title) => {
      setStaffMembers(
        staffMembers.map((member) =>
          member.id === editingStaff.id
            ? { ...member, userName: name, jobTitle: title }
            : member
        )
      );
      showToast("✨ Updated!", "Staff member details have been updated!");
      handleEditClose();
    });
  };

  const handleShare = () => {
    const shareableUrl = getShareableUrl({
      page: currentPage.toString(),
    });

    navigator.clipboard.writeText(shareableUrl);
    showToast("🔗 Link Copied!", "Share link has been copied to clipboard");
  };

  // Render individual staff card
  const renderStaffCard = (member: StaffMember) => (
    <Box
      key={member.id}
      data-testid="staff-card"
      bg="neutral.000"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      position="relative"
      transition="transform 0.2s"
      _hover={{ transform: "translateY(-4px)" }}
    >
          {/* Staff Photo */}
      <Image
        src={member.imageUrl}
        alt={member.userName}
        w="full"
        h="250px"
        objectFit="cover"
        cursor="pointer"
        onClick={() => setSelectedImage(member.imageUrl)}
        data-testid="staff-photo"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_IMAGE;
        }}
      />

      <Box p={4}>
        <Flex justify="space-between" align="start">
          {/* Info Section */}
          <Box flex="1">
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="neutral.900"
              data-testid="staff-name"
            >
              {member.userName}
            </Text>
            <Text color="neutral.700" data-testid="staff-title">
              {member.jobTitle}
            </Text>
          </Box>

          {/* Action Buttons */}
          <Flex gap={2}>
            <IconButton
              aria-label="Edit staff member"
              icon={<EditIcon />}
              size="md"
              fontSize="1.1em"
              variant="ghost"
              color="neutral.700"
              _hover={{ color: "blue.500" }}
              onClick={() => handleEditClick(member)}
              data-testid="edit-staff-button"
            />
            <IconButton
              aria-label="Delete staff member"
              icon={<DeleteIcon />}
              size="md"
              fontSize="1.1em"
              variant="ghost"
              color="neutral.700"
              _hover={{ color: "red.500" }}
              onClick={() => handleDelete(member.id)}
              data-testid="delete-staff-button"
            />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );

  // Set isClient upon mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return loading state for server-side rendering
  if (!isClient) {
    return (
      <Box
        minH="100vh"
        bgImage="url('/background.jpg')"
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgAttachment="fixed"
        position="relative"
        py={8}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" mb={8}>
            <Flex align="center" gap={3}>
              <Image src="/logo.png" h="60px" alt="PicPogo Logo" />
              <Text
                fontSize="4xl"
                textStyle="logo"
                color="blue.500"
                transform="rotate(-8deg)"
                data-testid="logo-text"
              >
                PicPogo!
              </Text>
            </Flex>

            <Flex
              as="a"
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              align="center"
              gap={2}
              bg="secondary.500"
              px={5}
              py={2.5}
              borderRadius="full"
              boxShadow="md"
              cursor="pointer"
            >
              <Text fontSize="lg" fontWeight="bold" color="neutral.900">
                Powered by
              </Text>
              <Image src="/pexels.png" h="28px" alt="Pexels Logo" />
            </Flex>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bgImage={`url('${BACKGROUND_IMAGE}')`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgAttachment="fixed"
      position="relative"
      py={8}
    >
      <Container maxW="container.xl">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8}>
          {/* Logo */}
          <Flex align="center" gap={2}>
            <Image
              src={LOGO_IMAGE}
              h={{ base: "40px", md: "60px" }}
              alt="PicPogo Logo"
            />
            <Text
              fontSize={{ base: "2xl", md: "4xl" }}
              textStyle="logo"
              color="blue.500"
              transform="rotate(-8deg)"
              data-testid="logo-text"
            >
              PicPogo!
            </Text>
          </Flex>

          {/* Pexels Attribution */}
          <Flex
            as="a"
            href={PEXELS_URL}
            target="_blank"
            rel="noopener noreferrer"
            align="center"
            gap={2}
            bg="secondary.500"
            px={{ base: 3, md: 5 }}
            py={{ base: 2, md: 2.5 }}
            borderRadius="full"
            boxShadow="md"
            cursor="pointer"
          >
            <Text
              fontSize={{ base: "sm", md: "lg" }}
              fontWeight="bold"
              color="neutral.900"
            >
              Powered by
            </Text>
            <Image
              src={PEXELS_LOGO}
              h={{ base: "20px", md: "28px" }}
              alt="Pexels Logo"
            />
          </Flex>
        </Flex>

        {/* Staff Cards Grid */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
          mb={8}
        >
          {staffMembers.length === 0 ? (
            <Text
              gridColumn="1/-1"
              textAlign="center"
              fontSize="2xl"
              textStyle="logo"
              color="blue.500"
              py={8}
              data-testid="empty-state-message"
            >
              Looks empty in here — Click &apos;Snap & Shine&apos; to add some
              sparkle! ✨
            </Text>
          ) : (
            staffMembers.slice(startIndex, endIndex).map(renderStaffCard)
          )}
        </Grid>

        {/* Control Buttons */}
        <Flex
          justify="space-between"
          align="center"
          flexDir={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          {/* Add Staff Button */}
          <Tooltip
            label="Add new staff"
            placement="top"
            hasArrow
            bg="neutral.700"
            color="white"
          >
            <Button
              leftIcon={imageLoading ? <Spinner size="sm" /> : <AddIcon />}
              colorScheme="primary"
              onClick={onAddOpen}
              data-testid="add-staff-button"
              w={{ base: "full", md: "auto" }}
              isDisabled={imageLoading}
            >
              {imageLoading ? "Loading..." : "Snap & Shine! ✨"}
            </Button>
          </Tooltip>

          {/* Pagination Controls */}
          {staffMembers.length > 0 && (
            <Flex
              justify="center"
              gap={2}
              w={{ base: "full", md: "auto" }}
              flexWrap="wrap"
            >
              <Button
                onClick={goToPreviousPage}
                disabled={!canGoToPreviousPage}
                variant="solid"
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, md: "auto" }}
                data-testid="previous-page-button"
              >
                Previous
              </Button>
              <Text
                alignSelf="center"
                color="neutral.900"
                data-testid="page-info"
                fontSize={{ base: "sm", md: "md" }}
                whiteSpace="nowrap"
              >
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                onClick={goToNextPage}
                disabled={!canGoToNextPage}
                variant="solid"
                size={{ base: "sm", md: "md" }}
                flex={{ base: 1, md: "auto" }}
                data-testid="next-page-button"
              >
                Next
              </Button>

              {/* Share Button */}
              <Tooltip
                label="Share this page"
                placement="top"
                hasArrow
                bg="neutral.700"
                color="white"
              >
                <IconButton
                  aria-label="Share page"
                  icon={<LinkIcon />}
                  onClick={handleShare}
                  variant="solid"
                  size={{ base: "sm", md: "md" }}
                  data-testid="share-button"
                  _hover={{ bg: "primary.500", color: "white" }}
                />
              </Tooltip>
            </Flex>
          )}
        </Flex>

        {/* Add Staff Modal */}
        <AddStaffModal
          isOpen={isAddOpen}
          onClose={handleAddClose}
          onSubmit={handleAddStaff}
          newName={newName}
          newTitle={newTitle}
          nameError={nameError}
          titleError={titleError}
          onNameChange={setNewName}
          onTitleChange={setNewTitle}
          onKeyDown={handleKeyDown}
        />

        {/* Edit Staff Modal */}
        <EditStaffModal
          isOpen={isEditOpen}
          onClose={handleEditClose}
          onSubmit={handleEditSubmit}
          newName={newName}
          newTitle={newTitle}
          nameError={nameError}
          titleError={titleError}
          onNameChange={setNewName}
          onTitleChange={setNewTitle}
        />

        {/* Image Modal */}
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageSrc={selectedImage}
        />
      </Container>
    </Box>
  );
}
