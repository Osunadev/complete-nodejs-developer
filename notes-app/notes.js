const fs = require('fs');
const chalk = require('chalk');

const msgs = {
    success: chalk.green.bold,
    warning: chalk.yellow.bold,
    error: chalk.red.bold,
    title: chalk.blue.inverse,
    body: chalk.white,
};

const listNotes = () => {
    const notes = loadNotes();

    notes.forEach(({ title, body }, idx) => {
        console.log(msgs.title(`${idx + 1} - ${title}`));
        console.log(msgs.body(body));
    });
};

const addNote = (title, body) => {
    const notes = loadNotes();

    const duplicateNote = notes.find((note) => note.title === title);

    if (!duplicateNote) {
        notes.push({ title, body });
        saveNotes(notes);
        console.log(msgs.success('Note added!'));
    } else {
        console.log(msgs.error('The title of the note already exists'));
    }
};

const removeNote = (title) => {
    const notes = loadNotes();

    const updatedNotes = notes.filter((note) => note.title !== title);

    if (updatedNotes.length === notes.length) {
        console.log(msgs.error('The note titled ' + title + " doesn't exist"));
        return;
    }

    console.log(msgs.success('Note removed!'));

    saveNotes(updatedNotes);
};

const saveNotes = (notes) => {
    const stringify = JSON.stringify(notes);

    fs.writeFileSync('notes.json', stringify);
};

const readNote = (title) => {
    const notes = loadNotes();

    const existingNote = notes.find((note) => note.title === title);

    if (existingNote) {
        console.log(msgs.title(existingNote.title));
        console.log(msgs.body(existingNote.body));
    } else {
        console.log(msgs.error(`Your note titled ${title} doesn't exist!`));
    }
};

const loadNotes = () => {
    try {
        const dataBuffer = fs.readFileSync('notes.json');
        const dataJSON = dataBuffer.toString();
        return JSON.parse(dataJSON);
    } catch (err) {
        return [];
    }
};

module.exports = {
    addNote,
    removeNote,
    readNote,
    listNotes,
};
