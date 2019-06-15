export enum ZIRMessageType {
    ERROR, // Unused so far
    COMMAND, // First routed to CommandManager
    RAW, // For flavor text, join messages, etc - without sender displayed. May later support markup.
    CHAT, // Displays with sender ChatName
}