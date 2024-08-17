/*********************
 * InsertIntoString Function
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
export const InsertIntoString = ({
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