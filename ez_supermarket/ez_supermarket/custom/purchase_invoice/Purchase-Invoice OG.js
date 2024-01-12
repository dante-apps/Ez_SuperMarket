// Purchase-Invoice OG

frappe.ui.form.on("Purchase Invoice", {
  refresh: function (frm) {
    if (
      frappe.user.has_role("PTPS_EXECUTIVE_1") ||
      frappe.user.has_role("PTPS_EXECUTIVE_2")
    ) {
      // if (frm.doc.docstatus === 0 && frm.doc.workflow_state == "Update Price") {
      frm.fields_dict.items.grid.add_custom_button(
        __("Update Price"),
        function () {
          showItemDialog(frm);
        }
      );
    }
  },
});

function showItemDialog(frm) {
  // Fetch items from the Purchase Order
  var items = frm.doc.items || [];

  // Index to keep track of the current item being displayed
  var currentIndex = 0;

  function updateDialogContent() {
    var dialog = new frappe.ui.Dialog({
      title: __("Update Prices"),
      size: "large",
      fields: [
        {
          fieldname: "item_code",
          label: "Item Code",
          fieldtype: "Data",
          reqd: 1,
          default: frm.doc.items[currentIndex].item_code,
          read_only: 1,
        },
        {
          fieldname: "received_qty",
          label: "Received",
          fieldtype: "Float",
          reqd: 1,
          default: frm.doc.items[currentIndex].qty,
        },
        {
          fieldname: "date_received",
          label: "Date Received",
          fieldtype: "Date",
          default: "Today",
        },
        {
          fieldname: "margin",
          label: "Margin",
          fieldtype: "Currency",
          onchange: function () {
            calculateSellingPrice(dialog);
          },
        },
        {
          fieldname: "column_break234",
          fieldtype: "Column Break",
        },
        {
          fieldname: "buying_price",
          label: "Buying Rate",
          fieldtype: "Currency",
          reqd: 1,
          default: frm.doc.items[currentIndex].rate,
          onchange: function () {
            calculateSellingPrice(dialog);
          },
        },
        {
          fieldname: "selling_price_wo_taxes",
          label: "Selling Price without Taxes",
          fieldtype: "Currency",
          read_only: 1,
        },
        {
          fieldname: "selling_price_with_taxes",
          label: "Selling Price with Taxes",
          fieldtype: "Currency",
          read_only: 1,
        },
        {
          fieldname: "tax_rate",
          label: "Tax %",
          fieldtype: "Data",
          read_only: 1,
          default: frm.doc.items[currentIndex].custom_tax,
        },

        {
          fieldname: "original_rate",
          label: "Original Rate",
          fieldtype: "Currency",
          default: frm.doc.items[currentIndex].rate,
          read_only: 1,
          hidden: 1,
        },
        {
          fieldname: "discount_amount",
          label: "Discount Rate",
          fieldtype: "Currency",
          hidden: 1,
          // default: frm.fields_dict["original_rate"].get_value() - values.buying_price,
        },
        {
          fieldname: "discount_percentage",
          label: "Discount Percentage",
          fieldtype: "Currency",
          hidden: 1,
        },
      ],
      primary_action: function () {
        var values = dialog.get_values();

        // var discount_amount = values.original_rate - values.buying_price;

        // Update the current item with the new values
        frm.doc.items[currentIndex].item_code = values.item_code;
        frm.doc.items[currentIndex].qty = values.received_qty;
        frm.doc.items[currentIndex].rate = values.buying_price;
        frm.doc.items[currentIndex].amount =
          values.buying_price * frm.doc.items[currentIndex].qty;
        // frm.doc.items[currentIndex].selling_price_wo_taxes =
        //   values.selling_price_wo_taxes;
        // frm.doc.items[currentIndex].selling_price_with_taxes =
        //   values.selling_price_with_taxes;
        // frm.doc.items[currentIndex].mrp_rate = values.mrp_rate;
        // frm.doc.items[currentIndex].margin = values.margin;
        // frm.doc.items[currentIndex].discount_amount = values.discount_amount;
        // frm.doc.items[currentIndex].discount_percentage =
        //   values.discount_percentage;
        //     values.original_rate) *
        //   100;
        // frm.doc.items[currentIndex].base_rate =
        //   frm.doc.items[currentIndex].rate;
        // frm.doc.items[currentIndex].base_amount =
        //   frm.doc.items[currentIndex].amount;
        // frm.doc.items[currentIndex].net_rate = frm.doc.items[currentIndex].rate;
        // frm.doc.items[currentIndex].net_amount =
        //   frm.doc.items[currentIndex].net_rate *
        //   frm.doc.items[currentIndex].qty;
        // frm.doc.items[currentIndex].base_net_rate =
        //   frm.doc.items[currentIndex].rate;
        // frm.doc.items[currentIndex].base_net_amount =
        //   frm.doc.items[currentIndex].net_rate *
        //   frm.doc.items[currentIndex].qty;

        // Refresh the items table to reflect the changes

        // frm.save();
        frm.fields_dict["items"].grid.refresh();

        // frm.fields_dict["items"].grid.get_field("rate").refresh();

        // Increment the index for the next item
        currentIndex++;

        // Check if there are more items to display
        if (currentIndex < items.length) {
          // If yes, update the dialog content again
          dialog.set_values({
            item_code: frm.doc.items[currentIndex].item_code,
            mrp_rate: frm.doc.items[currentIndex].custom_mrp,
            buying_price: frm.doc.items[currentIndex].rate,
            margin: "",
            tax_rate: frm.doc.items[currentIndex].custom_tax,
            selling_price_wo_taxes: "",
            selling_price_with_taxes: "",
            original_rate: frm.doc.items[currentIndex].rate,
            discount_amount: "",
            discount_percentage: "",
          });
        } else {
          // If no more items, close the dialog or perform any other actions
          dialog.hide();
          frappe.msgprint("Prices updated successfully");
        }
      },
      primary_action_label: __("Update"),
    });

    // Show the dialog
    dialog.show();
  }

  // Start the dialog with the first item
  if (items.length > 0) {
    updateDialogContent();
  } else {
    frappe.msgprint("No items to update");
  }
}

function calculateSellingPrice(dialog) {
  var buying_price = dialog.get_value("buying_price") || 0;
  var margin_percent = dialog.get_value("margin") || 0;
  var tax_rate = dialog.get_value("tax_rate") || 0;
  var original_rate = dialog.get_value("original_rate") || 0;

  // Add console logs to check values
  console.log("buying_price:", buying_price);
  console.log("margin_percent:", margin_percent);
  console.log("tax_rate:", tax_rate);
  console.log("original_rate:", original_rate);

  var selling_price_wo_taxes = (
    buying_price *
    (1 + margin_percent / 100)
  ).toFixed(2);
  var selling_price_with_taxes = (
    selling_price_wo_taxes *
    (1 + tax_rate / 100)
  ).toFixed(2);

  var discount_amount = original_rate - buying_price;
  var discount_percentage = (discount_amount / original_rate) * 100;

  // Add console log to check discount_amount
  console.log("discount_amount:", discount_amount);

  dialog.set_value("selling_price_wo_taxes", selling_price_wo_taxes);
  dialog.set_value("selling_price_with_taxes", selling_price_with_taxes);
  dialog.set_value("discount_amount", discount_amount);
  dialog.set_value("discount_percentage", discount_percentage);
}