import BookmarkNotesIdb from "../../data/bookmark-notes-idb";
import AuthApi from "../../networks/auth-api";
import NotesApi from "../../networks/notes-api";
import {
  createNoteListEmptyTemplate,
  noteItemTemplate,
  createRemoveBookmarkButtonTemplate,
  createBookmarkButtonTemplate,
} from "../templates/template-creator";

const Dashboard = {
  async render() {
    return `
      <div class="content">
        <h1>Dashboard</h1>

        <div id="notesList" class="mt-2 row justify-content-center gy-4"></div>
      </div>
    `;
  },

  async afterRender() {
    console.log("dashboard page");

    this._initialData();
  },

  async _initialData() {
    // Get all bookmarked notes data from indexedDB
    const allBookmarkedNotes = await BookmarkNotesIdb.getAllBookmarkedNotes();

    // Get all notes data from API
    const notes = await NotesApi.getAll();

    // Get user info
    const userInfo = await AuthApi.getUserInfo();

    // Get notesList element
    const notesListEl = document.getElementById("notesList");

    // Check if notes data is empty
    if (!notes.data.length) {
      return this._populateNotesListEmpty(notesListEl);
    }

    this._populateNotesList(notesListEl, notes, userInfo, allBookmarkedNotes);
  },

  _populateNotesList(containerEl, notes, userInfo, allBookmarkedNotes) {
    containerEl.innerHTML = "";

    // Sort notes by createdAt date in descending order
    notes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Populate notes list with note item template

    notes.data.forEach((note) => {
      // Check if note is bookmarked
      const isBookmarked = allBookmarkedNotes.find(
        (bookmarkedNote) => bookmarkedNote.id === note.id
      );

      const bookmarkButton = isBookmarked
        ? createRemoveBookmarkButtonTemplate(note.id)
        : createBookmarkButtonTemplate(note.id);

      containerEl.innerHTML += `
        <div class="col-12">
          ${noteItemTemplate(note, userInfo, bookmarkButton)}
        </div>
      `;
    });

    // Add event listener to delete button for each note item
    containerEl.querySelectorAll(`#deleteNoteButton`).forEach((el) => {
      el.addEventListener("click", async (event) => {
        const noteId = event.target.dataset.id;

        try {
          const response = await NotesApi.destroy(noteId);

          window.alert(response.message);
          this._initialData();
        } catch (error) {
          console.log(error);
        }
      });
    });

    // Add event listener to delete button for each note item
    containerEl.querySelectorAll(`#bookmarkButton`).forEach((el) => {
      el.addEventListener("click", async (event) => {
        const noteId = event.target.dataset.id;

        try {
          const note = await NotesApi.getById(noteId);
          await BookmarkNotesIdb.putBookmark(note.data);

          this._initialData();
        } catch (error) {
          console.error("Something wrong when bookmarking a note");
          console.error(error);
        }
      });
    });

    // Add event listener to delete button for each note item
    containerEl.querySelectorAll(`#removeBookmarkButton`).forEach((el) => {
      el.addEventListener("click", async (event) => {
        const noteId = event.target.dataset.id;

        try {
          await BookmarkNotesIdb.deleteBookmark(noteId);

          this._initialData();
        } catch (error) {
          console.error(
            "Something wrong when deleting bookmark note from IndexedDB"
          );
          console.error(error);
        }
      });
    });
  },

  _populateNotesListEmpty(containerEl) {
    containerEl.innerHTML = createNoteListEmptyTemplate();
  },
};

export default Dashboard;
