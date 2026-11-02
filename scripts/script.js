let activeNoteId = null;
let activeNote = null;
let isLight = true;

const workspace = document.querySelector(".workspace");
const hamburgerButton = document.getElementById("hamburger-icon");
const sideBar = document.querySelector(".sidebar-hidden");
const newNote = document.getElementById("new-note");

const noteTitle = document.querySelector(".note-title");
const noteContent = document.querySelector(".note-content");

const noteList = document.querySelector(".note-list");
const notesArr = [];
const listArr = [];

const themeImg = document.querySelector(".theme");
const themeSheet = document.querySelector(".themeStylesheet");
themeImg.addEventListener("click",
    () => {
        isLight = !isLight;
        chooseTheme();
        saveNotes();
    }
)

function chooseTheme(){
    if(isLight){
        themeImg.src = "images/moon.png"
        themeSheet.href = "styles/light.css";
    }else{
        themeImg.src = "images/sun.png";
        themeSheet.href = "styles/dark.css";
    }
}
const searchbar = document.querySelector(".search-bar");
searchbar.value = "";
searchbar.addEventListener("input", () => {
    populateSidebar(searchbar.value);
});

loadNotes();

newNote.addEventListener("click", 
    () => createNewNote()
);
noteTitle.addEventListener("input", () => {
    if (activeNote) {
        activeNote.title = noteTitle.value;
        updateSidebarTitle(activeNote);
        saveNotes();
    }
});

noteContent.addEventListener("input", () => {
    if (activeNote) {
        activeNote.text = noteContent.value;
        saveNotes();
    }
});
hamburgerButton.addEventListener("click", () => workspace.classList.toggle("sidebar-hidden"));

function setNote(note){
    activeNoteId = note.id;
    noteContent.value = note.text;
    noteTitle.value = note.title;
}

function createNewNote(){
    const newNote = {
        id: crypto.randomUUID(),
        text: "",
        title: ""
    };
    notesArr.shift(newNote);
    activeNoteId = newNote.id;
    activeNote = newNote;

    createNoteList(newNote);
    setNote(newNote);

    saveNotes();
}

function createNoteList(note) {
    let titleText = note.title;
    if (titleText === "") titleText = "New Note";

    const listItem = document.createElement("div");
    listItem.classList.add("list-item");
    listItem.dataset.noteId = note.id;
    listItem.addEventListener("click",
        () => selectNoteList(note.id)
    )

    const title = document.createElement("textarea");
    title.classList.add("list-item-text");
    title.value = titleText;
    title.readOnly = true;
    title.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            title.readOnly = true;
            title.blur();
        }
    });
    title.addEventListener("input", () => {
        note.title = title.value;

        if (activeNoteId === note.id) {
            noteTitle.value = note.title;
        }
    });

    title.addEventListener("blur", () => {
        title.readOnly = true;
        if(activeNoteId === note.id) activeNote.title = title.value;
    });

    const renameButton = document.createElement("button");
    renameButton.classList.add("list-button");
    renameButton.addEventListener("click", 
        (event) => {
            event.stopPropagation();
            renameNoteList(note.id)
        }
    );

    const renameImage = document.createElement("img");
    renameImage.src = "images/pencil.png";
    renameButton.append(renameImage);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("list-button");
    deleteButton.addEventListener("click",
        (event) => {
            event.stopPropagation();
            deleteNoteList(note.id)
        }
    );

    const deleteImage = document.createElement("img");
    deleteImage.src = "images/trash.png";
    deleteButton.append(deleteImage);

    listItem.append(title, renameButton, deleteButton);
    listArr.push(listItem);
    noteList.append(listItem);
}

function deleteNoteList(id) {
    const index = notesArr.findIndex(note => note.id === id);

    if (index === -1) return;

    notesArr.splice(index, 1);

    const listItem = noteList.querySelector(
        `[data-note-id="${id}"]`
    );

    if (activeNoteId === id) {
        activeNoteId = null;
        activeNote = null;
        noteTitle.value = "";
        noteContent.value = "";
    }

    listItem?.remove();
    saveNotes();
}
function renameNoteList(id){
    const listItem = noteList.querySelector(
        `[data-note-id="${id}"]`
    );

    const title = listItem.querySelector(".list-item-text");

    title.readOnly = false;
    title.focus();
    title.select();
    saveNotes();
}
function selectNoteList(id){
    activeNoteId = id;
    const currentNote = notesArr.find((note) => note.id === id);
    setNote(currentNote);
    activeNote = currentNote;

    saveNotes();
}
function updateSidebarTitle(note) {
    const listItem = noteList.querySelector(
        `[data-note-id="${note.id}"]`
    );

    const title = listItem.querySelector(".list-item-text");
    title.value = note.title || "New Note";
}


function saveNotes(){
    localStorage.setItem("notes", JSON.stringify(notesArr));
    localStorage.setItem("lastOpenNote", (activeNoteId));
    localStorage.setItem("isLight", JSON.stringify(isLight));
}
function loadNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    notesArr.push(...savedNotes);

    activeNoteId = localStorage.getItem("lastOpenNote");

    const savedTheme = localStorage.getItem("isLight");
    isLight = savedTheme === null ? true : savedTheme === "true";

    chooseTheme();

    activeNote = notesArr.find(
        note => note.id === activeNoteId
    ) || null;

    notesArr.forEach(note => createNoteList(note));

    if (activeNote) setNote(activeNote);
}

function populateSidebar(filterString) {
    const returnArr = notesArr.filter(note =>
        note.title.toLowerCase().includes(filterString.toLowerCase()) ||
        note.text.toLowerCase().includes(filterString.toLowerCase())
    );

    noteList.replaceChildren();
    listArr.length = 0;

    returnArr.forEach(note => createNoteList(note));
}