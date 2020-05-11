const chalk = require('chalk');
const yargs = require('yargs');
const { removeNote, addNote, listNotes, readNote } = require('./notes.js');

// Customize yargs version
yargs.version('1.1.0');

// Create add command
yargs.command({
    command: 'add',
    describe: 'Add a new note',
    builder: {
        title: {
            describe: 'Note title',
            // We need to provide a title option
            demandOption: true,
            type: 'string',
        },
        body: {
            describe: 'Note description',
            demandOption: true,
            type: 'string',
        },
    },
    // The handler receives and argv object.
    handler: ({ title, body }) => {
        addNote(title, body);
    },
});

yargs.command({
    command: 'remove',
    describe: 'Remove a note',
    builder: {
        title: {
            describe: 'Title of the note to remove',
            demandOption: true,
            type: 'string',
        },
    },
    handler: ({ title }) => {
        removeNote(title);
    },
});

yargs.command({
    command: 'list',
    describe: 'Listing the notes',
    handler: () => listNotes(),
});

yargs.command({
    command: 'read',
    describe: 'Reading a note',
    builder: {
        title: {
            describe: 'Title of the note to be read',
            demandOption: true,
            type: 'string',
        },
    },
    handler: ({ title }) => {
        readNote(title);
    },
});

yargs.parse();
