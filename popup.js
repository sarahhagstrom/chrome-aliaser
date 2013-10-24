var aliaser_popup = {
    displayMessage: function(text) {
	// Display an error message
	var message = document.getElementById("message");
	if (message) {
	    message.innerHTML = text;
	    message.style.display = "block";
	}
    },
    init: function(repopulate, highlightKey){
	// [Re]Build the popup from scratch, possibly highlighting
	// a newly added alias.
	var self = this;

	chrome.runtime.getBackgroundPage(function (backgroundPage) {
		var masterList = backgroundPage.aliaser.masterList;
		var keys = [];

		for(var j in masterList) {
		    keys.push(j);
		}
	    
		keys = keys.sort();

		var aliasTable = document.getElementById('aliasTable');
		var oldTbody = aliasTable.getElementsByTagName("tbody")[0];
		var newTbody = document.createElement('tbody');

		// Generate the table of existing aliases
		for(var i in keys) {
		    var rowCount = newTbody.rows.length;
		    var row = newTbody.insertRow(rowCount);
		    var cell0 = row.insertCell(0);
		    var cell1 = row.insertCell(1);
		    var cell2 = row.insertCell(2);
		    cell0.innerHTML = '<span class="aliasKey">' + keys[i] + '</span>';
		    cell1.innerHTML = '<span class="aliasValue">' + masterList[keys[i]].replace(/\%s/g, '<span class="param">%s</span>') + '<span>';
		    cell2.innerHTML = '<a class="deleteKey" id="delete_' + keys[i] + '">[delete]</a>';
		    cell0.vAlign = "top";
		    cell1.vAlign = "top";
		    cell2.vAlign = "top";

		    if (keys[i] === highlightKey) {
			row.className = "highlight";
			setTimeout(function() {
				// Undo the highlight after a while
				var highlights = document.getElementsByClassName("highlight");
				for (var h in highlights) {
				    highlights[h].className = "";
				}
			    }, 1000);
		    }
		}

		aliasTable.replaceChild(newTbody, oldTbody);

		// Bind delete on each row
		var deleteKeys = document.getElementsByClassName('deleteKey');

		for(var i = 0; i < deleteKeys.length; i++) {
		    deleteKeys[i].addEventListener('click', function() {
			    self.deleteItem(this);
			});
		}

		// Populate or depopulate the add-form inputs
		if(repopulate) {
		    document.getElementById('addAliasKey').value = "";
		    document.getElementById('addAliasValue').value = "";
		} else {
		    chrome.tabs.getSelected(null, function(tab) {
			    document.getElementById('addAliasValue').value = tab.url;
			});
		}
	    });
    },
    addItem: function() {
	// Add a new alias
	var self = this;
	var key = document.getElementById('addAliasKey').value;
	var value = document.getElementById('addAliasValue').value;

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
    deleteItem: function(item) {
	// Remove an alias
	var self = this;

	if (item.id.substring(0,7) == "delete_") {
	    var key = item.id.substring(7);
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
document.addEventListener('DOMContentLoaded', function() {
	aliaser_popup.init();

	var addAliasButton = document.getElementById('addAliasButton');
	var messageSpan = document.getElementById('message');

	addAliasButton.addEventListener('click', function() {
		aliaser_popup.addItem();
	    });

        document.addEventListener('keydown', function(e) {
		if (e && e.keyCode == 13) {
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