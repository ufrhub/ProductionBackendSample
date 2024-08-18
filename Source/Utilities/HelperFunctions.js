/*********************
 * INSERT_INTO_STRING Function
 * - This function inserts specified strings into a given string (`OriginalString`) at positions defined by the occurrence of certain characters.
 * - The function is highly customizable, allowing you to insert strings before or after specific characters.
 * 
 * Parameters:
 * - InsertBefore: The character before which the insertion should occur. (Default: empty string)
 * - CountInsertBefore: The occurrence count of `InsertBefore` at which the string should be inserted. (Default: 1)
 * - InsertAfter: The character after which the insertion should occur. (Default: empty string)
 * - CountInsertAfter: The occurrence count of `InsertAfter` at which the string should be inserted. (Default: 1)
 * - OriginalString: The string into which other strings will be inserted. (Default: empty string)
 * - InsertStringBefore: The string to be inserted before the specified character. (Default: empty string)
 * - InsertStringAfter: The string to be inserted after the specified character. (Default: empty string)
 * 
 * Return:
 * - The function returns the updated string with the inserted content or undefined if required parameters are missing.
 *********************/
export const INSERT_INTO_STRING = ({
    InsertBefore = "",
    CountInsertBefore = 1,
    InsertAfter = "",
    CountInsertAfter = 1,
    OriginalString = "",
    InsertStringBefore = "",
    InsertStringAfter = "",
}) => {
    /*******
     * If neither `InsertBefore` nor `InsertAfter` is provided, or if `OriginalString` is empty, or if neither `InsertStringBefore` 
     * nor `InsertStringAfter` is provided, the function returns undefined.
     *******/
    if ((!InsertBefore && !InsertAfter) || !OriginalString || (!InsertStringBefore && !InsertStringAfter)) return;

    /*******
     * Initialize `UpdatedString` with `OriginalString`.
     * - `BeforeCount` and `AfterCount` track the occurrence counts for `InsertBefore` and `InsertAfter`.
     * - These counts are initialized to 0 if the respective `CountInsertBefore` or `CountInsertAfter` is greater than 0, 
     *   otherwise, they are set to 2 to skip the loop for those cases.
     *******/
    let UpdatedString = OriginalString;
    let BeforeCount = CountInsertBefore > 0 ? 0 : 2;
    let AfterCount = CountInsertAfter > 0 ? 0 : 2;

    /*******
     * Loop through each character in `UpdatedString` to find the positions where insertions should happen.
     *******/
    for (let i = 0; i < UpdatedString.length; ++i) {
        /*******
         * Increment `BeforeCount` if the current character matches `InsertBefore`.
         *******/
        if (UpdatedString[i] === InsertBefore && BeforeCount < CountInsertBefore) ++BeforeCount;

        /*******
         * Increment `AfterCount` if the current character matches `InsertAfter`.
         *******/
        if (UpdatedString[i] === InsertAfter && AfterCount < CountInsertAfter) ++AfterCount;

        /*******
         * If `BeforeCount` matches `CountInsertBefore`, insert `InsertStringBefore` at the current position.
         * - Adjust `i` to account for the newly inserted string length to avoid infinite loops.
         *******/
        if (UpdatedString[i] === InsertBefore && BeforeCount === CountInsertBefore) {
            UpdatedString = UpdatedString.slice(0, i) + InsertStringBefore + UpdatedString.slice(i);
            i += InsertStringBefore.length;
            ++BeforeCount;
        }

        /*******
         * If `AfterCount` matches `CountInsertAfter`, insert `InsertStringAfter` after the current position.
         * - Adjust `i` to account for the newly inserted string length.
         *******/
        if (UpdatedString[i] === InsertAfter && AfterCount === CountInsertAfter) {
            UpdatedString = UpdatedString.slice(0, i + 1) + InsertStringAfter + UpdatedString.slice(i + 1);
            i += InsertStringAfter.length;
            ++AfterCount;
        }

        /*******
         * If both `BeforeCount` and `AfterCount` exceed their respective target counts, 
         * exit the loop as further insertions are unnecessary.
         *******/
        if (BeforeCount > CountInsertBefore && AfterCount > CountInsertAfter) break;
    }

    /*******
     * Return the updated string with the inserted content.
     *******/
    return UpdatedString;
}

/*********************
 * EXTRACT_FROM_STRING Function
 * - This function extracts specified substrings from a given string (`OriginalString`) based on the occurrence of certain characters.
 * - The function can extract characters before and after specified markers and return the updated string after removal.
 * 
 * Parameters:
 * - ExtractBefore: The character before which the extraction should occur. (Default: empty string)
 * - CountExtractBefore: The occurrence count of `ExtractBefore` at which extraction should happen. (Default: 1)
 * - ExtractAfter: The character after which the extraction should occur. (Default: empty string)
 * - CountExtractAfter: The occurrence count of `ExtractAfter` at which extraction should happen. (Default: 1)
 * - OriginalString: The string from which substrings will be extracted. (Default: empty string)
 * - CharactersToExtractBefore: The number of characters to extract before `ExtractBefore`. (Default: 0)
 * - CharactersToExtractAfter: The number of characters to extract after `ExtractAfter`. (Default: 0)
 * 
 * Return:
 * - The function returns an object containing the extracted substrings (`StringBefore` and `StringAfter`) 
 *   and the `UpdatedString` with the removed parts.
 *********************/
export const EXTRACT_FROM_STRING = ({
    ExtractBefore = "",
    CountExtractBefore = 1,
    ExtractAfter = "",
    CountExtractAfter = 1,
    OriginalString = "",
    CharactersToExtractBefore = 0,
    CharactersToExtractAfter = 0,
}) => {
    /*******
     * If neither `ExtractBefore` nor `ExtractAfter` is provided, or if `OriginalString` is empty,
     * the function returns null.
     *******/
    if ((!ExtractBefore && !ExtractAfter) || !OriginalString) return null;

    /*******
     * Initialize variables:
     * - `UpdatedString` with `OriginalString`.
     * - `StringBefore` and `StringAfter` to store the extracted substrings.
     * - `StringBeforeIndex` and `StringAfterIndex` to track positions for extraction.
     * - `BeforeCount` and `AfterCount` to track the occurrence counts for `ExtractBefore` and `ExtractAfter`.
     *******/
    let UpdatedString = OriginalString;
    let StringBefore = "";
    let StringAfter = "";
    let StringBeforeIndex = -1;
    let StringAfterIndex = -1;
    let BeforeCount = CountExtractBefore > 0 ? 0 : 2;
    let AfterCount = CountExtractAfter > 0 ? 0 : 2;

    /*******
     * Loop through each character in `OriginalString` to find the positions for extraction.
     *******/
    for (let i = 0; i < OriginalString.length; ++i) {
        /*******
         * Increment `BeforeCount` if the current character matches `ExtractBefore`.
         *******/
        if (OriginalString[i] === ExtractBefore && BeforeCount < CountExtractBefore) ++BeforeCount;

        /*******
         * Increment `AfterCount` if the current character matches `ExtractAfter`.
         *******/
        if (OriginalString[i] === ExtractAfter && AfterCount < CountExtractAfter) ++AfterCount;

        /*******
         * If `BeforeCount` matches `CountExtractBefore`, record the current index as `StringBeforeIndex`.
         *******/
        if (OriginalString[i] === ExtractBefore && BeforeCount === CountExtractBefore) {
            StringBeforeIndex = i;
            ++BeforeCount;
        }

        /*******
         * If `AfterCount` matches `CountExtractAfter`, record the current index as `StringAfterIndex`.
         *******/
        if (OriginalString[i] === ExtractAfter && AfterCount === CountExtractAfter) {
            StringAfterIndex = i;
            ++AfterCount;
        }

        /*******
         * If both `BeforeCount` and `AfterCount` exceed their respective target counts,
         * exit the loop as further extraction positions are unnecessary.
         *******/
        if (BeforeCount > CountExtractBefore && AfterCount > CountExtractAfter) {
            break;
        }
    }

    /*******
     * Extract `StringBefore` from `OriginalString` based on `StringBeforeIndex` and `CharactersToExtractBefore`.
     * Extract `StringAfter` from `OriginalString` based on `StringAfterIndex` and `CharactersToExtractAfter`.
     *******/
    StringBefore = StringBeforeIndex >= 0 ? OriginalString.substring(StringBeforeIndex - CharactersToExtractBefore, StringBeforeIndex) : "";
    StringAfter = StringAfterIndex >= 0 ? OriginalString.substring(StringAfterIndex + CharactersToExtractAfter + 1, StringAfterIndex + 1) : "";

    /*******
     * If `StringBeforeIndex` is less than or equal to `StringAfterIndex`, remove `StringBefore` and `StringAfter` from `UpdatedString`.
     * Return the extracted strings and the updated string.
     *******/
    if (StringBeforeIndex < StringAfterIndex || StringBeforeIndex === StringAfterIndex) {
        UpdatedString = UpdatedString.slice(0, StringBeforeIndex - CharactersToExtractBefore) + UpdatedString.slice(StringBeforeIndex);
        StringAfterIndex -= CharactersToExtractBefore;
        UpdatedString = UpdatedString.slice(0, StringAfterIndex + 1) + UpdatedString.slice(StringAfterIndex + CharactersToExtractAfter + 1);

        return { StringBefore, StringAfter, UpdatedString };
    }

    /*******
     * If `StringBeforeIndex` is greater than `StringAfterIndex`, remove `StringAfter` and `StringBefore` from `UpdatedString`.
     * Return the extracted strings and the updated string.
     *******/
    if (StringBeforeIndex > StringAfterIndex) {
        UpdatedString = UpdatedString.slice(0, StringAfterIndex + 1) + UpdatedString.slice(StringAfterIndex + CharactersToExtractAfter + 1);
        StringBeforeIndex -= CharactersToExtractAfter;
        UpdatedString = UpdatedString.slice(0, StringBeforeIndex - CharactersToExtractBefore) + UpdatedString.slice(StringBeforeIndex);

        return { StringBefore, StringAfter, UpdatedString };
    }

    /*******
     * Return the extracted strings and the updated string.
     *******/
    return { StringBefore, StringAfter, UpdatedString };
}
