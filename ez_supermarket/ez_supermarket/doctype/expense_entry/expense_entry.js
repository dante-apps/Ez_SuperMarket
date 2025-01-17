// Copyright (c) 2024, Balamurugan and contributors
// For license information, please see license.txt

frappe.provide("expense_entry.expense_entry");

function update_totals(frm, cdt, cdn) {
  var items = locals[cdt][cdn];
  var total = 0;
  var quantity = 0;
  frm.doc.expenses.forEach(function (items) {
    total += items.amount;
    quantity += 1;
  });
  frm.set_value("total_amount", total);
  refresh_field("total");
  frm.set_value("quantity", quantity);
  refresh_field("quantity");
}

frappe.ui.form.on("Expense Entry Item", {
  amount: function (frm, cdt, cdn) {
    update_totals(frm, cdt, cdn);
  },
  expenses_remove: function (frm, cdt, cdn) {
    update_totals(frm, cdt, cdn);
  },
  expenses_add: function (frm, cdt, cdn) {
    var d = locals[cdt][cdn];

    if (d.cost_center === "" || typeof d.cost_center == "undefined") {
      if (
        cur_frm.doc.default_cost_center != "" ||
        typeof cur_frm.doc.default_cost_center != "undefined"
      ) {
        d.cost_center = cur_frm.doc.default_cost_center;
        cur_frm.refresh_field("expenses");
      }
    }
  },
});

frappe.ui.form.on("Expense Entry", {
  before_save: function (frm) {
    $.each(frm.doc.expenses, function (i, d) {
      let label = "";

      if (d.cost_center === "" || typeof d.cost_center == "undefined") {
        if (
          cur_frm.doc.default_cost_center === "" ||
          typeof cur_frm.doc.default_cost_center == "undefined"
        ) {
          frappe.validated = false;
          frappe.msgprint(
            "Set a Default Cost Center or specify the Cost Center for expense <strong>number " +
              (i + 1) +
              "</strong>."
          );
          return false;
        } else {
          d.cost_center = cur_frm.doc.default_cost_center;
        }
      }
    });
  },
  refresh(frm) {
    //update total and qty when an item is added
  },
  onload: function (frm) {
    // Check the value of the Client Request checkbox
    frappe.model.with_doc(
      "Yb Supermarket Settings",
      "Yb Supermarket Settings",
      function () {
        var settings_doc = frappe.get_doc(
          "Yb Supermarket Settings",
          "Yb Supermarket Settings"
        );
        if (settings_doc.expense_entry == 0) {
          // If Client Request is not checked, hide the form and throw an error
          $.each(frm.fields_dict, function (fieldname, field) {
            field.df.hidden = 1;
          });
          frm.refresh_fields();
          // Disable the Save button
          frm.disable_save();
          var settings_link = frappe.utils.get_form_link(
            "Yb Supermarket Settings",
            settings_doc.name
          );
          frappe.throw(
            "You must enable <strong>Expense Entry</strong> feature in <a href='" +
              settings_link +
              "'><strong>Yb Supermarket Settings</a></strong> to access this page."
          );
        }
      }
    );

    //console.log("hello");

    frm.set_query("expense_account", "expenses", () => {
      return {
        filters: [
          ["Account", "root_type", "=", "Expense"],
          ["Account", "is_group", "=", "0"],
        ],
      };
    });
    frm.set_query("cost_center", "expenses", () => {
      return {
        filters: [["Cost Center", "is_group", "=", "0"]],
      };
    });
    frm.set_query("default_cost_center", () => {
      return {
        filters: [["Cost Center", "is_group", "=", "0"]],
      };
    });
  },
  // grand_total: function (frm) {
  //   let total_amount = 0;
  //   frm.doc.items.forEach(function (item) {
  //     total_amount += item.amount;
  //   });
  //   frm.set_value("grand_total", total_amount);
  // },
});
