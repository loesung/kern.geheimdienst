/*
 * Here defines global variables that is used in controlling the behaviour of
 * core.
 * 
 * You can finely tune such behaviours, but before any modification, make sure
 * you know what you're doing!
 */



///////////////////////////////// ENCRYPT ////////////////////////////////////
/*
 * This section defines parameters used in encrypting a message with
 * user-inputed passphrase, codebook, or public keys.
 */

// Default bytes for a main encryption key, used for actual encryption of
// data.
DEFAULT_ENCRYPT_KEY_LENGTH = 128;

// Acceptable min. length of passphrase in bytes. Used in cases when using
// pure passphrase to encrypt a message.
PASSPHRASE_MIN_LENGTH = 20;



/////////////////////////// CODEBOOK MANAGEMENTS /////////////////////////////
/*
 * This section defines parameters used in creating, importing, managing and
 * using a codebook.
 */

// Default codebook life(seconds). Default 2592000 equals to 30 days.
DEFAULT_CODEBOOK_LIFE = 2592000;

// Max. codebook life(seconds). Default 315360000 equals to 10 years.
CODEBOOK_LIFE_MAX = 315360000;

// Min. codebook life(seconds). Default 3600 equals to 1 hour. 
CODEBOOK_LIFE_MIN = 3600;

// Min. length of a sharedsecret.
MIN_SHAREDSECRET_LENGTH = 32;

// Always verify codebook integrity(i.e. checking codebook ID matches codebook
// content) before use.
ALWAYS_VERIFY_CODEBOOK_INTEGRITY = true;
