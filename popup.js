// TODO: fix width issue, hides [delete]

var aliaser_popup = {
    displayMessage: function (text) {
        "use strict";
        // Display an error message
        var message = document.getElementById("message");

        if (message) {
            message.innerHTML = text;
            message.style.display = "block";
        }
    },
    undoHighlights: function () {
        "use strict";
        // Undo the highlight after a while
        var highlights = document.getElementsByClassName("highlight"),
            j;

        for (j = 0; j < highlights.length; j++) {
            if (highlights.hasOwnProperty(j)) {
                highlights[j].className = "";
            }
        }
    },
    init: function (repopulate, highlightKey) {
        "use strict";

        // [Re]Build the popup from scratch, possibly highlighting
        // a newly added alias.
        var self = this;

        chrome.runtime.getBackgroundPage(function (backgroundPage) {
            self.buildTable(backgroundPage, repopulate, highlightKey);
        });
    },
    buildTable: function (backgroundPage, repopulate, highlightKey) {
        "use strict";

        var masterList = backgroundPage.aliaser.masterList,
            keys = [],
            i,
            aliasTable = document.getElementById('aliasTable'),
            oldTbody = aliasTable.getElementsByTagName("tbody")[0],
            newTbody = document.createElement('tbody'),
            deleteKeys,
            self = this;

        for (i in masterList) {
            if (masterList.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        keys = keys.sort();

        // Generate the table of existing aliases
        for (i in keys) {
            if (keys.hasOwnProperty(i)) {
                this.buildRow(newTbody, keys[i], masterList[keys[i]], highlightKey);
            }
        }

        aliasTable.replaceChild(newTbody, oldTbody);

        // Bind delete on each row
        deleteKeys = document.getElementsByClassName('deleteKey');

        for (i = 0; i < deleteKeys.length; i++) {
            deleteKeys[i].addEventListener('click', function () {
                self.deleteItem(this);
            });
        }

        // Bind edit on each row
        var topLevelRows = aliasTable.getElementsByTagName("tr");

        for (i in topLevelRows) {
            if (topLevelRows.hasOwnProperty(i)) {

            }
        }

        // Populate or depopulate the add-form inputs
        if (repopulate) {
            document.getElementById('addAliasKey').value = "";
        }

        chrome.tabs.getSelected(null, function (tab) {
            document.getElementById('addAliasValue').value = tab.url;
        });
    },
    buildRow: function (tableBody, key, value, highlightKey) {
        "use strict";

        var rowCount = tableBody.rows.length,
            row = tableBody.insertRow(rowCount),
            cell0 = row.insertCell(0),
            cell1 = row.insertCell(1),
            cell2 = row.insertCell(2);

        cell0.innerHTML = '<span class="aliasKey">' + key + '</span>';
        cell1.innerHTML = '<span class="aliasValue"><div style="word-wrap: break-word">' + value.replace(/\%s/g, '<span class="param">%s</span>') + '</div></span>';
        cell2.innerHTML = '<a class="deleteKey" id="delete_' + key + '">[delete]</a>';
        cell0.vAlign = "top";
        cell1.vAlign = "top";
        cell2.vAlign = "top";

        if (key === highlightKey) {
            row.className = "highlight";
            setTimeout(this.undoHighlights, 1000);
        }
    },
    addItem: function () {
        "use strict";

        // Add a new alias
        var self = this,
            key = document.getElementById('addAliasKey').value,
            value = document.getElementById('addAliasValue').value;

        try {
            chrome.runtime.getBackgroundPage(function (backgroundPage) {
                try {
                    backgroundPage.aliaser.addAlias(key, value);
                    self.init(true, key);
                } catch (whoops) {
                    self.displayMessage(whoops);
                }
            });
        } catch (whoops) {
            this.displayMessage(whoops);
        }
    },
    deleteItem: function (item) {
        "use strict";

        // Remove an alias
        var self = this,
            key;

        if (item.id.substring(0, 7) === "delete_") {
            key = item.id.substring(7);
            try {
                chrome.runtime.getBackgroundPage(function (backgroundPage) {
                    try {
                        backgroundPage.aliaser.removeAlias(key);
                        self.init();
                    } catch (whoops) {
                        self.displayMessage(whoops);
                    }
                });
            } catch (whoops) {
                this.displayMessage("An unexpected error occurred while attempting to delete key: " + key);
            }
        }
    }
};

// Run the population script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    "use strict";
    aliaser_popup.init();

    var addAliasButton = document.getElementById('addAliasButton'),
        messageSpan = document.getElementById('message');

    addAliasButton.addEventListener('click', function () {
        aliaser_popup.addItem();
    });

    document.addEventListener('keydown', function (e) {
        if (e && e.keyCode === 13) {
            // Hitting enter is the same as clicking on the
            // add button
            aliaser_popup.addItem();
        } else {
            // Hide any error message once the user starts
            // typing. Presumably they're fixing the problem
            messageSpan.style.display = "none";
        }
    });
});