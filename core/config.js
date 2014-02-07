/*
 * Here defines global variables that is used in controlling the behaviour of
 * core.
 * 
 * You can finely tune such behaviours, but before any modification, make sure
 * you know what you're doing!
 */

///////////////////////////////// ENCRYPT ////////////////////////////////////

// Default bytes for a encryption key, used for actual encryption of data.
DEFAULT_ENCRYPT_KEY_LENGTH = 128;

// Acceptable min. length of passphrase in bytes.
PASSPHRASE_MIN_LENGTH = 20;


/////////////////////////// CODEBOOK MANAGEMENTS /////////////////////////////

// Default codebook life(seconds). Default 2592000 equals to 30 days.
DEFAULT_CODEBOOK_LIFE = 2592000;

// Max. codebook life(seconds). Default 315360000 equals to 10 years.
CODEBOOK_LIFE_MAX = 315360000;

// Min. codebook life(seconds). Default 3600 equals to 1 hour. 
CODEBOOK_LIFE_MIN = 3600;

// Min. length of a sharedsecret.
MIN_SHAREDSECRET_LENGTH = 32;

