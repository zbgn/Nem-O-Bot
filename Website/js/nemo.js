/**
 * Sort Table on collumn number n.
 * @param {Number} n - Collumn number
 */
function sortTable(n) {
  const table = document.getElementById('nemo-song-list');
  let rows;
  let switching = true;
  let i;
  let x;
  let y;
  let shouldSwitch;
  // Set the sorting direction to ascending:
  let dir = 'asc';
  let switchcount = 0;

  /* Make a loop that will continue until
            no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName('TR');
    /* Loop through all table rows (except the
                        first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
                                    one from current row and one from the next: */
      x = rows[i].getElementsByTagName('TD')[n];
      y = rows[i + 1].getElementsByTagName('TD')[n];
      /* Check if the two rows should switch place,
                                    based on the direction, asc or desc: */
      if (dir == 'asc') {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == 'desc') {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
                                    and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount++;
    } else {
      /* If no switching has been done AND the direction is "asc",
                                    set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == 'asc') {
        dir = 'desc';
        switching = true;
      }
    }
  }
}
/**
 * Build the table based on the json.
 * @param {String} slHead - Reference to the id of the thead.
 * @param {String} slBody - Reference to the id of the tbody.
 */
function buildHtmlTable(slHead, slBody) {
  const xmlhttp = new XMLHttpRequest();
  const snackbar = document.getElementById('nemo-snackbar');
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const jsonObj = JSON.parse(this.responseText);
      const urlParams = new URLSearchParams(window.location.search);
      const channelName = urlParams.get('channel');
      if (channelName) {
        const songlist = jsonObj['#' + channelName.toLowerCase()];
        if (songlist) {
          const columns = addAllColumnHeaders(songlist, slHead);
          $(slBody).empty();
          for (let i = 0; i < songlist.length; i++) {
            const row$ = $('<tr/>');
            for (let colIndex = 0; colIndex < columns.length; colIndex++) {
              let cellValue = songlist[i][columns[colIndex]];
              if (cellValue === true) cellValue = '✔';
              else if (cellValue === false) cellValue = '✘';
              else if (cellValue === -1) cellValue = 'already played';
              else if (cellValue === null) cellValue = '';
              row$.append($('<td/>')
                  .addClass('column' + (colIndex + 1))
                  .html(cellValue));
            }
            $(slBody).append(row$);
            document.getElementById('nemo-song-list').style.display = '';
            snackbar.innerHTML = 'Displaying ' + channelName
                        + '\'s music request queue';
          }
        } else {
          snackbar.innerHTML = channelName
                    + '\'s music request queue not found.'
                    + '<br> Search another name.';
        }
      }
      snackbar.className = 'show';
      setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
      }, 3000);
    }
  };
  xmlhttp.open('GET', '/songlist.json?v=' + (Date.now()).toString(), true);
  xmlhttp.send();
}

/**
 * Adds a header row to the table and returns the set of columns.
 * Need to do union of keys from all records as some records may not contain
 * all records.
 * @param {Object} myList
 * @param {String} slHead
 *
 * @return {Array}
 */
function addAllColumnHeaders(myList, slHead) {
  const columnSet = [];
  const headerTr$ = $('<tr/>').addClass('table100-head');

  for (let i = 0; i < myList.length; i++) {
    const rowHash = myList[i];
    for (const key in rowHash) {
      if ($.inArray(key, columnSet) == -1) {
        if (key == 'username') continue;
        else {
          columnSet.push(key);
          const th$ = $('<th/>')
              .addClass('column' + columnSet.length)
              .html(key);
          th$.onclick = function() {
            sortTable(columnSet.length);
          };
          headerTr$.append(th$);
        }
      }
    }
  }
  return columnSet;
}
