// API url used to show the data in tabulator
const AJAX_API_URL = "http://13.234.218.36:5001/api/users";

// API url used to update the selected records 
const UPDATE_API_URL = "http://13.234.218.36:5001/api/update-user";

// Number of records to fetch from the server
const PAGE_SIZE = 200;

// Luxon.js object used to handle date input
const DateTime = luxon.DateTime;

// KEYS used to update the selected records
const UpdateKeys = {
  EMAIL: "email",
  NAME: "name",
  DOB: "dob",
  LOCATION: "location",
  PHONE_NUMBER: "phone_number",
  GENDER: "gender",
  FAVOURITE: "favourite",
};

/**
 * Utility to handle keydown event 
 * @param e 
 * event listener
 * 
 */
const handleKeyDown = (e, onChange, cancel) => {
  if (e.key === "Enter") {
    onChange();
  }
  
  if (e.key === "Escape") {
    cancel();
  }
}

/**
 * Header Date Editor that used to filter the records.
 * @param cell 
 * @param onRendered 
 * @param success 
 * @param cancel 
 * 
 */ 
const headerDateEditor = function (cell, onRendered, success, cancel) {

  // cell parameter contains the data of the cell
  //  onRendered is a callback that will be called when the input is rendered
  //  success is a callback that is used to update the cell value
  //  cancel is a callback that can be used to abort the cell value updating.
  const input = document.createElement("input");

  input.setAttribute("type", "date");

  input.style.padding = "4px";
  input.style.width = "100%";
  input.style.boxSizing = "border-box";
  input.value = cell?.getValue();

  onRendered(function () {
    input.focus();
    input.style.height = "100%";
  });

  function onChange() {
    success(input.value);
  }

  //submit new value on change
  input.addEventListener("change", onChange);

  //submit new value on enter
  input.addEventListener("keydown", e => handleKeyDown(e, onChange, cancel));

  return input;
};

/**
 * This function will check whether the row is selected or not, and if it is selected then only the cell will be editable
 * @param cell 
 * 
 */
const editCheck = function(cell){
    //get row data
    const data = cell.getRow();
 
    return  data?._row?.modules?.select?.selected;
}

/**
 * Date editor that used to update the date value of the records 
 * @param cell the cell component for the editable cell
 * @param onRendered function to call when the editor has been rendered
 * @param success function to call to pass the successfully updated value to Tabulator
 * @param cancel function to call to abort the edit and return to a normal cell
 * 
 */
const dateEditor = function (cell, onRendered, success, cancel) {

    const date = new Date(cell.getValue());

    const cellValue = DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
    
    const input = document.createElement("input");

    input.setAttribute("type", "date");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;
    onRendered(function () {
      input.focus();
      input.style.height = "100%";
    });

    function onChange() {
      if (input.value !== cellValue) {
        success(
          DateTime.fromFormat(input.value, "yyyy-MM-dd").toFormat("yyyy-MM-dd")
        );
      } else {
        success(cell.getValue());
      }
    }

    //submit new value on blur or change
    input.addEventListener("change", onChange);

    //submit new value on enter
    input.addEventListener("keydown", e => handleKeyDown(e, onChange, cancel));

    return input;
  };

// Tabulator columns definition
const tableColumns = [
  {
    formatter: "rowSelection",
    titleFormatter: "rowSelection",
    headerHozAlign: "center",
    hozAlign: "center",
    vertAlign: "middle",
    headerSort: false,
    cellClick: function (e, cell) {
      cell.getRow().toggleSelect();
    },
  },
  { title: "ID", field: "id", width: 80 },
  {
    title: "Name",
    field: "name",
    width: 150,
    editor: "input",
    headerFilter: "input",
    sorter: "string",
    validator: "required",
    editable: editCheck,
    headerWordWrap: true,

    // callback fires when column is clicked
    // headerClick:()=> alert("header")

    // 
    validator:"string"
  },
  {
    title: "Email",
    field: "email",
    width: 150,
    editor: "input",
    editable: editCheck,
    headerFilter: "input",
    validator: "required",
  },
  {
    title: "Phone Number",
    field: "phone_number",
    width: 150,
    editor: "input",
    editable: editCheck,
    headerFilter: "input",
    validator: "required",
  },
  {
    title: "Location",
    field: "location",
    width: 130,
    editor: "input",
    editable: editCheck,
    validator: "required",
    editorParams: {
      autocomplete: "true",
      allowEmpty: true,
      listOnEmpty: true,
      valuesLookup: true,
    },
  },
  {
    title: "Gender",
    field: "gender",
    editor: "list",
    editorParams: {
      values: { male: "Male", female: "Female" },
      clearable: true,
    },
    editable: editCheck,
    headerFilter: "list",
    headerFilterParams: {
      values: { male: "Male", female: "Female" },
      clearable: true,
    },
    validator: "required",
  },
  {
    title: "Favourite Color",
    field: "favourite",
    editor: "input",
    editable: editCheck,
    headerFilter: "list",
    validator: "required",
    headerFilterParams: { valuesLookup: true, clearable: true },
  },
  {
    title: "Date Of Birth",
    field: "dob",
    hozAlign: "center",
    width: 140,
    editor: dateEditor,
    editable: editCheck,
    headerFilter: headerDateEditor,
    validator: "required",
    cssClass: "dob-filter",
    formatter: function (cell, formatterParams, onRendered) {
      //cell - the cell component
      //formatterParams - parameters set for the column
      //onRendered - function to call when the formatter has been rendered

      return DateTime.fromJSDate(new Date(cell.getValue())).toFormat(
        "dd/MM/yyyy"
      ); 
    },
  },
];

// Tabulator options
const tableOptions = {
  // ---- pagination with numbers
  pagination:true,
  paginationMode:"remote",
  paginationSize:5,

  
  // ------ infinite scroll pagination
  // progressiveLoad: "scroll",

  // 
  // paginationAddRow: "table",  // page | table

  // 
  validationMode:"highlight",


  // 
  dataLoader: true,
  dataLoaderLoading: `
  <style>
    .loader {
  width: 50px;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #2527b0;
  --_m: 
    conic-gradient(#0000 10%,#000),
    linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
          mask: var(--_m);
  -webkit-mask-composite: source-out;
          mask-composite: subtract;
  animation: l3 1s infinite linear;
}
@keyframes l3 {to{transform: rotate(1turn)}}
  </style>
  <div class="loader"></div>
  `,



  virtualDom: true,
  height: "500px",
  layout: "fitColumns",
  sortMode: "remote",      // local | remote
  filterMode: "remote",     // local | remote


  // for overwriting param names
  // dataReceiveParams:{
  //   "per_page":"per_pages", //change last_page parameter name to "max_pages"
  // },

  placeholderHeaderFilter: "No Matching Data",
  paginationSize: PAGE_SIZE,
  placeholder: "No Data Set",
  progressiveLoadScrollMargin: 2700,
  headerFilterLiveFilterDelay: 1000,
  columnDefaults: {
    headerTooltip: true,
    tooltip: true,
  },

  columns: tableColumns,
  ajaxURL: AJAX_API_URL,
  ajaxURLGenerator: function (url, _config, params) {
    const sortBy = params?.sort
      ?.map((sortParam) => `${sortParam?.field}:${sortParam?.dir}`)
      .join(",");
    const formattedParams = {
      page: params?.page,
      per_page: params?.per_page ?? PAGE_SIZE,
      ...(sortBy && { sort_by: sortBy }),
    };
    params?.filter?.forEach((sortParam) => {
      if (sortParam?.field) {
        formattedParams[sortParam.field] = sortParam?.value;
      }
    });
    const searchParams = new URLSearchParams(formattedParams);
    return url + `?${searchParams?.toString()}`;
  },
};

const reset = () => {
  window.location.reload();
};

/**
 * Utility to deep clone the objects or arrays
 * @param input 
 * 
 */
const deepClone = (input) => {
  if (input === null || typeof input !== "object") {
    return input;
  }
  const initialValue = Array.isArray(input) ? [] : {};
  return Object.keys(input).reduce((acc, key) => {
    acc[key] = deepClone(input[key]);
    return acc;
  }, initialValue);
};

/**
 * Utility to update the the table records
 * @param value  new value of the cell
 * @param updateKey key that will be updated
 * @param index index of the table record
 * 
 */
const handleChange = (value, updateKey, index) => {
  const copyData = deepClone(table?.getSelectedData());
  copyData[index][updateKey] = value;
  copyData[index]["isUpdated"] = true;
};

/**
 * API call to update the data on the database
 * @param payload 
 * 
 */
const updateRecord = async (payload) => {
  try {
    const response = await axios.post(UPDATE_API_URL, payload);
    return response;
  } catch (err) {
    return err;
  }
};

/**
 * Utility to enable/disable the update button
 * 
 */
const toggleUpdateButton = () => {
    const isButtonDIsabled = table?.getSelectedData()?.length === 0 || table?.getSelectedData()?.filter(data => data?.isUpdated)?.length === 0
    updateBtn.disabled = isButtonDIsabled
}

/**
 * Utility to get the type of an input field
 * @param key Form key 
 * 
 */
const getInputType = (key) => {
  if (key === UpdateKeys.EMAIL) {
    return "email";
  } else if (key === UpdateKeys.DOB) {
    return "date";
  } else {
    return "text";
  }
};

// Instantiate the tabulator object
const table = new Tabulator("#example-table", tableOptions);

// Target the update button and disable it
const updateBtn = document.getElementById("update-btn");
updateBtn.disabled = true;

// Target the confirmation button of the confirmation modal
const confirmSaveBtn = document.getElementById("confirm-save");

// Target the confirmation modal. It is used to show and hide the modal from JS
const confirmationModal = new bootstrap.Modal(document.getElementById("confirmation-modal"));

// Show the confirmation modal on click of update button
updateBtn.addEventListener("click", () => {
  confirmationModal.show()
});


confirmSaveBtn.addEventListener("click", async () => {
    confirmationModal.hide()
    const updatedRecords = table.getSelectedData()?.filter((data) => data?.isUpdated);
      const response = await updateRecord({
        updates: updatedRecords,
      });
      if (response.status === 200) {
        alert("Records updated successfully");
        if (table) {
          table?.updateData(updatedRecords);
          table.deselectRow(table?.getSelectedData()?.map((data) => data?.id));
          if(table?.getHeaderFilters()?.length){
            table.refreshFilter()
          }
        }
      } else {
        alert(response?.response?.data?.error || "Something went wrong");
      }
      
})

// Function that will be called when the row selection changes
table.on("rowSelectionChanged", function (data, rows, selected, deselected) {
  toggleUpdateButton()
});

// Function that will be called when the cell is edited
table.on("cellEdited", function(cell){
    const updatedData = cell._cell.row.data
    table?.updateData([{...updatedData, isUpdated: true}])
    toggleUpdateButton()
});

Tabulator.extendModule("validate", "validators", {
  divTen:function(cell, value, parameters){
      //cell - the cell component for the edited cell
      //value - the new input value of the cell
      //parameters - the parameters passed in with the validator

      return !value % 10; //only allow values that are divisible by 10;
  },
});