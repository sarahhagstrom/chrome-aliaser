var chromeAliaserPopup = chromeAliaserPopup || {};

(function (obj) {
    "use strict";

    obj.displayMessage = function (text) {
        // Display an error message
        var message = document.getElementById("message");

        if (message) {
            message.innerHTML = text;
            message.style.display = "block";
        }
    };

    obj.undoHighlights = function () {
        // Undo the highlight after a while
        var highlights = document.getElementsByClassName("highlight"),
            j;

        for (j = 0; j < highlights.length; j++) {
            if (highlights.hasOwnProperty(j)) {
                highlights[j].className = "";
            }
        }
    };

    obj.init = function (repopulate, highlightKey) {
        // [Re]Build the popup from scratch, possibly highlighting
        // a newly added alias.
        chrome.runtime.getBackgroundPage(function (backgroundPage) {
            obj.buildTable(backgroundPage, repopulate, highlightKey);
        });
    };

    obj.buildTable = function (backgroundPage, repopulate, highlightKey) {

        var masterList = backgroundPage.chromeAliaser.masterList,
            keys = [],
            i,
            aliasTable = document.getElementById('aliasTable'),
            oldTbody = aliasTable.getElementsByTagName("tbody")[0],
            newTbody = document.createElement('tbody'),
            deleteKeys,
            saveKeys;

        for (i in masterList) {
            if (masterList.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        keys = keys.sort();

        // Generate the table of existing aliases
        for (i in keys) {
            if (keys.hasOwnProperty(i)) {
                obj.buildRow(newTbody, keys[i], highlightKey, masterList);
            }
        }

        aliasTable.replaceChild(newTbody, oldTbody);

        // Bind delete on each row
        deleteKeys = document.getElementsByClassName('deleteKey');

        for (i = 0; i < deleteKeys.length; i++) {
            deleteKeys[i].addEventListener('click', function () {
                obj.deleteItem(this);
            });
        }

        // Bind save on each row
        saveKeys = document.getElementsByClassName('saveKey');

        for (i = 0; i < saveKeys.length; i++) {
            saveKeys[i].addEventListener('click', function () {
                obj.editItem(this.parentElement.parentElement);
            });
        }

        // Populate or depopulate the add-form inputs
        if (repopulate) {
            document.getElementById('addAliasKey').value = "";
        }

        chrome.tabs.getSelected(null, function (tab) {
            document.getElementById('addAliasValue').value = tab.url;
        });
    };

    obj.cancelAllEdits = function (tableBody, masterList) {
        var editRows = tableBody.querySelectorAll("tr:nth-child(even)"),
            displayRows = tableBody.querySelectorAll("tr:nth-child(odd)"),
            i,
            key;

        for (i = 0; i < displayRows.length; i++) {
            if (displayRows.hasOwnProperty(i)) {
                displayRows[i].style.display = "";
            }
        }

        for (i = 0; i < editRows.length; i++) {
            if (editRows.hasOwnProperty(i)) {
                editRows[i].style.display = "none";

                try {
                    // And reset the values. (This part is highly unessential, so make sure
                    // nothing breaks if this fails.)
                    key = editRows[i].children[2].children[0].getAttribute("data-old-key");
                    editRows[i].children[0].children[0].value = key;
                    editRows[i].children[1].children[0].value = masterList[key];
                } catch (e) {
                    obj.log(e);
                }
            }
        }
    };

    obj.buildRow = function (tableBody, key, highlightKey, masterList) {

        var value = masterList[key],
            rowCount = tableBody.rows.length,
            row1 = tableBody.insertRow(rowCount),
            row2,
            cell10 = row1.insertCell(0),
            cell11 = row1.insertCell(1),
            cell12 = row1.insertCell(2),
            cell20,
            cell21,
            cell22,
            ifEnterInvokeEdit = function (event, element) {
                if (event && event.keyCode === 13) {
                    // Hitting enter is the same as clicking on the
                    // add button
                    obj.editItem(element.parentElement);
                } else {
                    // Hide any error message once the user starts
                    // typing. Presumably they're fixing the problem
                    document.getElementById('message').style.display = "none";
                }
            };

        cell10.innerHTML = '<span class="aliasKey">' + key + '</span>';
        cell11.innerHTML = '<span class="aliasValue"><div style="word-wrap: break-word">' + value.replace(/\%s/g, '<span class="param">%s</span>') + '</div></span>';
        cell12.innerHTML = '<a class="deleteKey" id="delete_' + key + '">[delete]</a>';
        cell10.vAlign = "top";
        cell11.vAlign = "top";
        cell12.vAlign = "top";

        if (key === highlightKey) {
            row1.className = "highlight";
            setTimeout(this.undoHighlights, 1000);
        }

        row2 = tableBody.insertRow(rowCount + 1);
        cell20 = row2.insertCell(0);
        cell21 = row2.insertCell(1);
        cell22 = row2.insertCell(2);
        cell20.innerHTML = '<input type="text" value="' + key + '" />';
        cell21.innerHTML = '<input type="text" value="' + value + '" />';
        cell22.innerHTML = '<a class="saveKey" data-old-key="' + key + '">[save]</a>';
        cell20.vAlign = "top";
        cell21.vAlign = "top";
        cell22.vAlign = "top";
        row2.style.display = "none";

        cell10.addEventListener('click', function () {
            obj.cancelAllEdits(tableBody, masterList);
            row1.style.display = "none";
            row2.style.display = "";
        });

        cell11.addEventListener('click', function () {
            obj.cancelAllEdits(tableBody, masterList);
            row1.style.display = "none";
            row2.style.display = "";
        });

        cell20.addEventListener('keydown', function (e) {
            ifEnterInvokeEdit(e, this);
        });

        cell21.addEventListener('keydown', function (e) {
            ifEnterInvokeEdit(e, this);
        });
    };

    obj.addItem = function () {
        // Add a new alias
        var key = document.getElementById('addAliasKey').value,
            value = document.getElementById('addAliasValue').value;

        obj.saveAlias(key, value);
    };

    obj.editItem = function (row) {
        var input1 = row.children[0].children[0],
            input2 = row.children[1].children[0],
            oldValue = row.children[2].children[0].getAttribute("data-old-key");

        obj.removeAlias(oldValue);
        obj.saveAlias(input1.value, input2.value);
    };

    obj.deleteItem = function (item) {
        // Remove an alias
        var key;

        if (item.id.substring(0, 7) === "delete_") {
            key = item.id.substring(7);
            obj.removeAlias(key);
        }
    };

    obj.removeAlias = function (key) {

        try {
            chrome.runtime.getBackgroundPage(function (backgroundPage) {
                try {
                    backgroundPage.chromeAliaser.removeAlias(key);
                    obj.init();
                } catch (whoops) {
                    obj.displayMessage(whoops);
                }
            });
        } catch (whoops) {
            obj.displayMessage("An unexpected error occurred while attempting to delete key: " + key);
        }
    };

    obj.saveAlias = function (key, value) {

        try {
            chrome.runtime.getBackgroundPage(function (backgroundPage) {
                try {
                    backgroundPage.chromeAliaser.addAlias(key, value);
                    obj.init(true, key);
                } catch (whoops) {
                    obj.displayMessage(whoops);
                }
            });
        } catch (whoops) {
            obj.displayMessage(whoops);
        }
    };
}(chromeAliaserPopup));

// Run the population script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    "use strict";
    chromeAliaserPopup.init();

    var addAliasButton = document.getElementById('addAliasButton'),
        messageSpan = document.getElementById('message'),
        ifEnterInvokeAdd = function (e) {
            if (e && e.keyCode === 13) {
                // Hitting enter is the same as clicking on the
                // add button
                chromeAliaserPopup.addItem();
            } else {
                // Hide any error message once the user starts
                // typing. Presumably they're fixing the problem
                messageSpan.style.display = "none";
            }
        };

    // Bind the add-button click to the add-alias function
    addAliasButton.addEventListener('click', function () {
        chromeAliaserPopup.addItem();
    });

    // Bind the enter key to Add if the focus is currently in the Add form
    document.getElementById('addAliasKey').addEventListener('keydown', function (e) {
        ifEnterInvokeAdd(e);
    });

    document.getElementById('addAliasValue').addEventListener('keydown', function (e) {
        ifEnterInvokeAdd(e);
    });
});