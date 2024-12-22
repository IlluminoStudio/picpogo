/// <reference types="cypress" />
import "../support/commands";
import { ANIMATION_DELAY } from '../../src/constants/app-constants';

// Mock clipboard to work around browser security limitations
const setupClipboardAndVisit = (path = "/") => {
  cy.visit(path, {
    onBeforeLoad(win) {
      // Create the clipboard it doesn't exist
      if (!win.navigator.clipboard) {
        Object.defineProperty(win.navigator, "clipboard", {
          value: {
            writeText: () => Promise.resolve(),
            readText: () => Promise.resolve("http://localhost:3000/?page=1"),
          },
          configurable: true,
        });
      }
      // Now stub the methods
      cy.stub(win.navigator.clipboard, "writeText").resolves();
    },
  });
};

describe("1. Page Display", () => {
  describe("Main UI Elements", () => {
    beforeEach(() => {
      cy.seedStaff("6staff");
      cy.visit("/");
      cy.wait(300);
    });

    it("shows all UI elements correctly", () => {
      // Check logo
      cy.get('img[alt="PicPogo Logo"]').should("be.visible");
      cy.get('[data-testid="logo-text"]').should("be.visible");

      // Check Pexels attribution
      cy.contains("Powered by").should("be.visible");
      cy.get('img[alt="Pexels Logo"]').should("be.visible");

      // Check main action buttons
      cy.get('[data-testid="add-staff-button"]')
        .should("be.visible")
        .and("be.enabled");
      cy.get('[data-testid="share-button"]')
        .should("be.visible")
        .and("be.enabled");
    });

    describe("On Empty Page", () => {
      beforeEach(() => {
        cy.window().then((win) => {
          win.localStorage.clear();
        });
        cy.seedStaff("0staff");
        cy.visit("/");
        cy.wait(300);
      });

      it("displays empty state", () => {
        cy.get('[data-testid="staff-card"]').should("not.exist");
        cy.get('[data-testid="empty-state-message"]').should("be.visible");
        cy.get('[data-testid="previous-page-button"]').should("not.exist");
        cy.get('[data-testid="next-page-button"]').should("not.exist");
        cy.get('[data-testid="page-info"]').should("not.exist");
        cy.get('[data-testid="share-button"]').should("not.exist");
      });
    });

    describe("State Retention", () => {
      it("retains state across page reloads", () => {
        // Load 7 staff members to make 2 pages
        cy.seedStaff("7staff");
        cy.visit("/");
        cy.wait(500);

        // Perform state changes
        // Add new staff
        cy.get('[data-testid="add-staff-button"]').click();
        cy.get('[data-testid="name-input"]').type("New Person");
        cy.get('[data-testid="title-input"]').type("New Role");
        cy.get('[data-testid="submit-button"]').click();
        cy.wait(500); // Wait for state to update

        // Verify staff was added
        cy.get('[data-testid="staff-card"]').should('have.length', 6);
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 1 of 2");

        // Edit staff
        cy.get('[data-testid="edit-staff-button"]').first().click();
        cy.get('[data-testid="edit-name-input"]').clear().type("Updated Name");
        cy.get('[data-testid="edit-title-input"]').clear().type("Updated Role");
        cy.get('[data-testid="edit-submit-button"]').click();
        cy.wait(500); // Wait for state to update

        // Verify edit was successful
        cy.get('[data-testid="staff-card"]')
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "Updated Name");
            cy.get('[data-testid="staff-title"]').should("have.text", "Updated Role");
          });

        // Delete staff
        cy.get('[data-testid="staff-card"]').eq(1).within(() => {
          cy.get('[data-testid="delete-staff-button"]').click();
        });
        cy.wait(500); // Wait for state to update

        // Verify deletion and page count
        cy.get('[data-testid="staff-card"]').should('have.length', 6);
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 1 of 2");

        // Navigate to page 2
        cy.get('[data-testid="next-page-button"]').click();
        cy.wait(500); // Wait for navigation

        // Verify we're on page 2 before reload
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 2 of 2");
        cy.get('[data-testid="staff-card"]').should('have.length', 1);

        // Reload and wait for state to restore
        cy.reload();
        cy.wait(1000); // Give more time for state to restore

        // Verify page 2 content after reload
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 2 of 2");
        cy.get('[data-testid="staff-card"]')
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "New Person");
            cy.get('[data-testid="staff-title"]').should("have.text", "New Role");
          });

        // Verify page 1 content
        cy.get('[data-testid="previous-page-button"]').click();
        cy.wait(500); // Wait for navigation
        cy.get('[data-testid="staff-card"]')
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "Updated Name");
            cy.get('[data-testid="staff-title"]').should("have.text", "Updated Role");
          });
        cy.get('[data-testid="staff-card"]')
          .should("have.length", 6)
          .each(($card) => {
            cy.wrap($card).within(() => {
              cy.get('[data-testid="staff-name"]').invoke('text').should('not.equal', 'Michael Chen');
              cy.get('[data-testid="staff-title"]').invoke('text').should('not.equal', 'CTO');
            });
          });
      });
    });
  });

  describe("Pagination", () => {
    describe("Empty State", () => {
      beforeEach(() => {
        cy.seedStaff("0staff");
        cy.visit("/");
        cy.wait(300);
      });

      it("shows correct empty state", () => {
        cy.get('[data-testid="staff-card"]').should("not.exist");
        cy.contains("Looks empty in here").should("be.visible");
        cy.get('[data-testid="page-info"]').should("not.exist");
        cy.get('[data-testid="previous-page-button"]').should("not.exist");
        cy.get('[data-testid="next-page-button"]').should("not.exist");
      });
    });

    describe("Single Page States", () => {
      it("handles single item correctly", () => {
        cy.seedStaff("1staff");
        cy.visit("/");
        cy.wait(300);

        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 1 of 1");
        cy.get('[data-testid="previous-page-button"]').should("be.disabled");
        cy.get('[data-testid="next-page-button"]').should("be.disabled");

        cy.get('[data-testid="staff-card"]')
          .should("have.length", 1)
          .first()
          .within(() => {
            cy.get('[data-testid="staff-photo"]')
              .should("have.attr", "src")
              .and("include", "mona.jpeg");
            cy.get('[data-testid="staff-name"]').should("have.text", "John Doe");
            cy.get('[data-testid="staff-title"]').should("have.text", "Developer");
          });
      });

      it("handles full page correctly", () => {
        cy.seedStaff("6staff");
        cy.visit("/");
        cy.wait(300);

        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 1 of 1");
        cy.get('[data-testid="previous-page-button"]').should("be.disabled");
        cy.get('[data-testid="next-page-button"]').should("be.disabled");

        cy.get('[data-testid="staff-card"]')
          .should("have.length", 6)
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "Sarah Johnson");
            cy.get('[data-testid="staff-title"]').should("have.text", "CEO");
          });
      });
    });

    describe("Multiple Pages", () => {
      beforeEach(() => {
        cy.seedStaff("7staff");
        cy.visit("/");
        cy.wait(300);
      });

      it("handles navigation between pages", () => {
        // Check first page
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 1 of 2");
        cy.get('[data-testid="previous-page-button"]').should("be.disabled");
        cy.get('[data-testid="next-page-button"]').should("be.enabled");
        cy.get('[data-testid="staff-card"]')
          .should("have.length", 6)
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "Sarah Johnson");
            cy.get('[data-testid="staff-title"]').should("have.text", "CEO");
          });

        // Navigate to second page
        cy.get('[data-testid="next-page-button"]').click();
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 2 of 2");
        cy.get('[data-testid="previous-page-button"]').should("be.enabled");
        cy.get('[data-testid="next-page-button"]').should("be.disabled");
        cy.get('[data-testid="staff-card"]')
          .should("have.length", 1)
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "Lisa Martinez");
            cy.get('[data-testid="staff-title"]').should("have.text", "HR Director");
          });

        // Return to first page
        cy.get('[data-testid="previous-page-button"]').click();
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 1 of 2");
        cy.get('[data-testid="previous-page-button"]').should("be.disabled");
        cy.get('[data-testid="next-page-button"]').should("be.enabled");
        cy.get('[data-testid="staff-card"]').should("have.length", 6);
      });
    });
  });
});

describe("2. Staff Management", () => {
  describe("Adding Staff", () => {
    describe("First Staff Member", () => {
      beforeEach(() => {
        cy.window().then((win) => {
          win.localStorage.clear();
        });
        cy.seedStaff("0staff");
        cy.visit("/");
        cy.wait(300);
        cy.get('[data-testid="add-staff-button"]').click();
      });

      it("validates form fields", () => {
        // Empty fields validation
        cy.get('[data-testid="submit-button"]').click();
        cy.get('[data-testid="name-error"]').should("be.visible");
        cy.get('[data-testid="title-error"]').should("be.visible");

        // Invalid characters validation
        cy.get('[data-testid="name-input"]').type("123");
        cy.get('[data-testid="title-input"]').type("456");
        cy.get('[data-testid="submit-button"]').click();
        cy.get('[data-testid="name-error"]').should("be.visible");
        cy.get('[data-testid="title-error"]').should("be.visible");

        // Length validation
        cy.get('[data-testid="name-input"]')
          .clear()
          .type("a");
        cy.get('[data-testid="title-input"]').clear().type("b");
        cy.get('[data-testid="submit-button"]').click();
        cy.get('[data-testid="name-error"]').should("be.visible");
        cy.get('[data-testid="title-error"]').should("be.visible");

        // Special characters validation
        cy.get('[data-testid="name-input"]')
          .clear()
          .type("O'Connor-Smith");
        cy.get('[data-testid="title-input"]')
          .clear()
          .type("Senior Dev");
        cy.get('[data-testid="submit-button"]').click();
        cy.get('[data-testid="name-error"]').should("not.exist");
        cy.get('[data-testid="title-error"]').should("not.exist");
      });

      it("handles keyboard interactions", () => {
        // Escape key closes modal
        cy.get('[data-testid="name-input"]').type("John Doe");
        cy.get("body").type("{esc}");
        cy.get('[data-testid="add-modal-content"]').should("not.exist");
      });

      it("adds first member", () => {
        cy.get('[data-testid="name-input"]').type("John Doe");
        cy.get('[data-testid="title-input"]').type("Developer");
        cy.get('[data-testid="submit-button"]').click();

        cy.get('[data-testid="staff-card"]')
          .should("have.length", 1)
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "John Doe");
            cy.get('[data-testid="staff-title"]').should("have.text", "Developer");
            cy.get('[data-testid="staff-photo"]')
              .should("have.attr", "src")
              .and("include", "https://images.pexels");
          });

        cy.get('[data-testid="empty-state-message"]').should("not.exist");
      });
    });

    describe("Additional Staff", () => {
      beforeEach(() => {
        cy.seedStaff("6staff");
        cy.visit("/");
        cy.wait(300);
      });

      it("adds to existing staff", () => {
        cy.get('[data-testid="add-staff-button"]').click();
        cy.get('[data-testid="name-input"]').type("New Person");
        cy.get('[data-testid="title-input"]').type("New Role");
        cy.get('[data-testid="submit-button"]').click();

        cy.get('[data-testid="next-page-button"]').click();

        cy.get('[data-testid="staff-card"]')
          .first()
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "New Person");
            cy.get('[data-testid="staff-title"]').should("have.text", "New Role");
          });
      });

      it("verifies pagination after adding 7th staff member", () => {
        // Add new staff member
        cy.get('[data-testid="add-staff-button"]').click();
        cy.get('[data-testid="name-input"]').type("Alice Brown");
        cy.get('[data-testid="title-input"]').type("Software Engineer");
        cy.get('[data-testid="submit-button"]').click();

        // Verify we're on page 1 and pagination text is correct
        cy.get('[data-testid="page-info"]')
          .should("be.visible")
          .and("contain", "Page 1 of 2");

        // Navigate to page 2
        cy.get('[data-testid="next-page-button"]').click();

        // Verify the newly added staff member is on page 2
        cy.get('[data-testid="staff-card"]')
          .should("have.length", 1)
          .within(() => {
            cy.get('[data-testid="staff-name"]').should("have.text", "Alice Brown");
            cy.get('[data-testid="staff-title"]').should("have.text", "Software Engineer");
          });
      });

      it("handles Pexels API error when adding staff", () => {
        // Start with just 1 staff member
        cy.seedStaff("1staff");
        cy.visit("/");
        cy.wait(300);

        // Intercept Pexels API to simulate error
        cy.intercept('GET', '**/v1/search*', {
          statusCode: 500,
          body: 'API Error'
        }).as('pexelsError');

        // Add new staff member
        cy.get('[data-testid="add-staff-button"]').click();
        cy.get('[data-testid="name-input"]').type("Error Test");
        cy.get('[data-testid="title-input"]').type("Error Role");
        cy.get('[data-testid="submit-button"]').click();

        // Verify fallback image is used
        cy.get('[data-testid="staff-card"]')
          .should('have.length', 2)
          .last()
          .within(() => {
            cy.contains("Error Test").should("be.visible");
            cy.contains("Error Role").should("be.visible");
            cy.get('[data-testid="staff-photo"]')
              .should('have.attr', 'src')
              .and('include', 'mona.jpeg');
          });
      });
    });
  });

  describe("Editing Staff", () => {
    beforeEach(() => {
      cy.seedStaff("1staff");
      cy.visit("/");
      cy.wait(300);
    });

    it("edits name with validation", () => {
      // Invalid edit attempt
      cy.get('[data-testid="edit-staff-button"]').first().click();
      cy.get('[data-testid="edit-name-input"]').clear().type("123");
      cy.get('[data-testid="edit-submit-button"]').click();

      // Should show error and keep modal open
      cy.get('[data-testid="edit-name-error"]').should("be.visible");
      cy.get('[data-testid="edit-modal-content"]').should("be.visible");

      // Should retain original value in card
      cy.get('[data-testid="staff-card"]')
        .first()
        .find('[data-testid="staff-name"]')
        .should("have.text", "John Doe");

      // Valid edit
      cy.get('[data-testid="edit-name-input"]').clear().type("John Smith");
      cy.get('[data-testid="edit-submit-button"]').click();

      // Modal should close
      cy.get('[data-testid="edit-modal-content"]').should("not.exist");

      // Should update the card
      cy.get('[data-testid="staff-card"]')
        .first()
        .find('[data-testid="staff-name"]')
        .should("have.text", "John Smith");
    });

    it("edits title with validation", () => {
      // Invalid edit attempt
      cy.get('[data-testid="edit-staff-button"]').first().click();
      cy.get('[data-testid="edit-title-input"]').clear().type("456");
      cy.get('[data-testid="edit-submit-button"]').click();

      // Should show error and keep modal open
      cy.get('[data-testid="edit-title-error"]').should("be.visible");
      cy.get('[data-testid="edit-modal-content"]').should("be.visible");

      // Should retain original value in card
      cy.get('[data-testid="staff-card"]')
        .first()
        .find('[data-testid="staff-title"]')
        .should("have.text", "Developer");

      // Valid edit
      cy.get('[data-testid="edit-title-input"]')
        .clear()
        .type("Senior Developer");
      cy.get('[data-testid="edit-submit-button"]').click();

      // Modal should close
      cy.get('[data-testid="edit-modal-content"]').should("not.exist");

      // Should update the card
      cy.get('[data-testid="staff-card"]')
        .first()
        .find('[data-testid="staff-title"]')
        .should("have.text", "Senior Developer");
    });

    it("handles cancel during edit", () => {
      cy.get('[data-testid="edit-staff-button"]').first().click();
      cy.get('[data-testid="edit-name-input"]').clear().type("New Name");
      cy.get('[data-testid="edit-cancel-button"]').click();

      // Modal should close
      cy.get('[data-testid="edit-modal-content"]').should("not.exist");

      // Should retain original value
      cy.get('[data-testid="staff-card"]')
        .first()
        .find('[data-testid="staff-name"]')
        .should("have.text", "John Doe");
    });

    it("handles escape key during edit", () => {
      cy.get('[data-testid="edit-staff-button"]').first().click();
      cy.get('[data-testid="edit-name-input"]').clear().type("New Name");
      cy.get("body").type("{esc}");

      // Wait for modal to close
      cy.wait(300);

      // Modal should close
      cy.get('[data-testid="edit-modal-content"]').should("not.exist");

      // Should retain original value
      cy.get('[data-testid="staff-card"]')
        .first()
        .find('[data-testid="staff-name"]')
        .should("have.text", "John Doe");
    });

    it("edit only one field", () => {
      // Initial values
      cy.get('[data-testid="staff-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="staff-name"]').should("have.text", "John Doe");
          cy.get('[data-testid="staff-title"]').should(
            "have.text",
            "Developer"
          );
        });

      // Edit only the name
      cy.get('[data-testid="edit-staff-button"]').first().click();
      cy.get('[data-testid="edit-name-input"]').clear().type("John Smith");
      cy.get('[data-testid="edit-submit-button"]').click();

      // Verify both fields
      cy.get('[data-testid="staff-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="staff-name"]').should(
            "have.text",
            "John Smith"
          );
          cy.get('[data-testid="staff-title"]').should(
            "have.text",
            "Developer"
          );
        });
    });

    it("edits both fields", () => {
      // Open edit modal
      cy.get('[data-testid="edit-staff-button"]').first().click();

      // Edit both fields
      cy.get('[data-testid="edit-name-input"]').clear().type("Jane Wilson");
      cy.get('[data-testid="edit-title-input"]').clear().type("Senior Architect");
      cy.get('[data-testid="edit-submit-button"]').click();

      // Modal should close
      cy.get('[data-testid="edit-modal-content"]').should("not.exist");

      // Verify both fields are updated
      cy.get('[data-testid="staff-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="staff-name"]').should("have.text", "Jane Wilson");
          cy.get('[data-testid="staff-title"]').should("have.text", "Senior Architect");
        });

      // Verify persistence after reload
      cy.visit("/");
      cy.wait(300);
      cy.get('[data-testid="staff-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="staff-name"]').should("have.text", "Jane Wilson");
          cy.get('[data-testid="staff-title"]').should("have.text", "Senior Architect");
        });
    });
  });

  describe("Deleting Staff", () => {
    beforeEach(() => {
      cy.seedStaff("1staff");
      cy.visit("/");
      cy.wait(300);
    });

    it("deletes member", () => {
      cy.get('[data-testid="delete-staff-button"]').first().click();
      cy.get('[data-testid="staff-card"]').should("not.exist");
      cy.get('[data-testid="empty-state-message"]')
        .should("be.visible")
        .and("contain", "Looks empty in here");
    });

    it("verifies pagination after deleting from 7 staff", () => {
      // Start with 7 staff members
      cy.seedStaff("7staff");
      cy.visit("/");
      cy.wait(300);

      // Delete from the head of the list
      cy.get('[data-testid="delete-staff-button"]').first().click();

      // Verify pagination info shows single page
      cy.get('[data-testid="page-info"]')
        .should("be.visible")
        .and("contain", "Page 1 of 1");

      // Verify pagination buttons are disabled
      cy.get('[data-testid="previous-page-button"]').should("be.disabled");
      cy.get('[data-testid="next-page-button"]').should("be.disabled");

      // Verify deleted staff no longer exists
      cy.contains("Sarah Johnson").should("not.exist");
      cy.contains("CEO").should("not.exist");

      // Verify we have exactly 6 staff cards
      cy.get('[data-testid="staff-card"]').should("have.length", 6);
    });

    it("deletes last member and persists after reload", () => {
      // Delete the last staff member
      cy.get('[data-testid="delete-staff-button"]').first().click();

      // Verify initial deletion
      cy.get('[data-testid="staff-card"]').should("not.exist");
      cy.get('[data-testid="empty-state-message"]')
        .should("be.visible")
        .and("contain", "Looks empty in here");

      // Reload the page
      cy.reload();
      cy.wait(300);

      // Verify staff remains deleted after reload
      cy.get('[data-testid="staff-card"]').should("not.exist");
      cy.get('[data-testid="empty-state-message"]')
        .should("be.visible")
        .and("contain", "Looks empty in here");
    });
  });
});

describe("3. Photo Interaction", () => {
  beforeEach(() => {
    cy.seedStaff("1staff");
    cy.visit("/");
    cy.wait(ANIMATION_DELAY);
  });

  it("handles image loading errors by falling back to mona", () => {
    cy.seedStaff("4staffWithError");
    cy.visit("/");
    cy.wait(ANIMATION_DELAY);

    // Check that photo falls back to mona.jpeg
    cy.get('[data-testid="staff-card"]')
      .eq(2)
      .within(() => {
        cy.contains("Emily Rodriguez");
        cy.get('[data-testid="staff-photo"]')
          .should("have.attr", "src")
          .and("include", "mona.jpeg");
      });
  });

  it("handles photo modal", () => {
    // Open modal by clicking photo
    cy.get('[data-testid="staff-photo"]').first().click();
    cy.get('[data-testid="image-modal"]').should("be.visible");
    cy.get('[data-testid="modal-image"]')
      .should("have.attr", "src")
      .and("include", "mona.jpeg");

    // Close by clicking overlay
    cy.get('[data-testid="image-modal"]').parent().click("topLeft");
    cy.wait(ANIMATION_DELAY); // Wait for animation
    cy.get('[data-testid="image-modal"]').should("not.exist");

    // Open again
    cy.get('[data-testid="staff-photo"]').first().click();
    cy.get('[data-testid="image-modal"]').should("be.visible");

    // Close with escape key
    cy.get("body").type("{esc}");
    cy.wait(ANIMATION_DELAY); // Wait for animation
    cy.get('[data-testid="image-modal"]').should("not.exist");
  });
});

describe("4. Share Functionality", () => {
  describe("Share Link Generation", () => {
    it("should generate correct link for single page", () => {
      cy.seedStaff("1staff");
      setupClipboardAndVisit();

      cy.get('[data-testid="share-button"]').click();
      cy.window().then((win) => {
        expect(win.navigator.clipboard.writeText).to.be.calledWith(
          Cypress.sinon.match((url: string) => {
            return url.includes("?page=1");
          })
        );
      });
      cy.contains("🔗 Link Copied!").should("be.visible");
    });

    it("should generate correct link for multiple pages", () => {
      // Seed test with 2 pages of staff
      cy.seedStaff("7staff");
      setupClipboardAndVisit();

      // Test sharing page 1
      cy.get('[data-testid="share-button"]').click();
      cy.window().then((win) => {
        expect(win.navigator.clipboard.writeText).to.be.calledWith(
          Cypress.sinon.match((url: string) => {
            return url.includes("?page=1");
          })
        );
      });

      // Test sharing page 2
      cy.get('[data-testid="next-page-button"]').click();
      cy.get('[data-testid="page-info"]', { timeout: 10000 })
        .should("be.visible")
        .and("contain", "Page 2 of 2");

      cy.get('[data-testid="share-button"]').click();
      cy.window().then((win) => {
        expect(win.navigator.clipboard.writeText).to.be.calledWith(
          Cypress.sinon.match((url: string) => {
            return url.includes("?page=2");
          })
        );
      });
    });
  });

  describe("Share Link Navigation", () => {
    beforeEach(() => {
      cy.seedStaff("7staff");
    });

    it("handles shared links after staff reduction", () => {
      // Start on page 2
      setupClipboardAndVisit("/?page=2");
      cy.get('[data-testid="page-info"]')
        .should("contain", "Page 2 of 2");
      cy.get('[data-testid="staff-card"]').should("have.length", 1);

      // Delete staff to reduce to single page
      cy.get('[data-testid="delete-staff-button"]').click();
      cy.contains("👋 See you later!").should("be.visible");
      cy.get('[data-testid="page-info"]')
        .should("be.visible")
        .and("contain", "Page 1 of 1");
      cy.get('[data-testid="staff-card"]').should("have.length", 6);

      // Try to visit page 2 again (should redirect to page 1)
      setupClipboardAndVisit("/?page=2");
      cy.get('[data-testid="page-info"]')
        .should("be.visible")
        .and("contain", "Page 1 of 1");
      cy.get('[data-testid="staff-card"]').should("have.length", 6);
      cy.get('[data-testid="previous-page-button"]').should("be.disabled");
      cy.get('[data-testid="next-page-button"]').should("be.disabled");
    });

    it("handles empty staff list with invalid page parameter", () => {
      cy.seedStaff("0staff");
      setupClipboardAndVisit("/?page=999");
      cy.get('[data-testid="empty-state-message"]').should("be.visible");
      cy.get('[data-testid="share-button"]').should("not.exist");
    });
  });

  describe("Share After State Changes", () => {
    it("shares functions correctly after state changes", () => {
      // Setup initial state with 7 staff (2 pages)
      cy.seedStaff("7staff");
      setupClipboardAndVisit("/?page=2");

      // Verify page 2's initial state
      cy.get('[data-testid="page-info"]').should("contain", "Page 2 of 2");
      cy.get('[data-testid="staff-card"]').should("have.length", 1);

      // Verify page 2 share link
      cy.get('[data-testid="share-button"]').click();
      cy.window().then((win) => {
        expect(win.navigator.clipboard.writeText).to.be.calledWith(
          Cypress.sinon.match((url: string) => {
            return url.includes("?page=2");
          })
        );
      });

      // Delete staff member to reduce to 1 page
      cy.get('[data-testid="delete-staff-button"]').first().click();
      cy.contains("👋 See you later!").should("be.visible");

      // Verify automatic redirection to page 1
      cy.get('[data-testid="page-info"]')
        .should("not.contain", "Page 2 of")
        .should("contain", "Page 1 of 1");
      cy.get('[data-testid="staff-card"]').should("have.length", 6);

      // Verify share link now points to page 1
      cy.get('[data-testid="share-button"]').click();
      cy.window().then((win) => {
        expect(win.navigator.clipboard.writeText).to.be.calledWith(
          Cypress.sinon.match((url: string) => {
            return url.includes("?page=1");
          })
        );
      });

      // Verify old page 2 link redirects to page 1
      setupClipboardAndVisit("/?page=2");
      cy.get('[data-testid="page-info"]')
        .should("be.visible")
        .and("contain", "Page 1 of 1");
      cy.get('[data-testid="staff-card"]').should("have.length", 6);
      cy.get('[data-testid="previous-page-button"]').should("be.disabled");
      cy.get('[data-testid="next-page-button"]').should("be.disabled");
    });
  });
});
