

import frappe
from frappe import _

def before_save(self):
    if self.purpose == "Material Transfer":
        for item in self.items:
            # Fetch values from the Item doctype and set to the Stock Entry item
            item_doc = frappe.get_doc("Item", item.item_code)
            item.s_warehouse = item_doc.custom_default_store_warehouse
            item.s_location = item_doc.custom_default_store_location
            item.t_warehouse = item_doc.custom_default_stall_warehouse
            item.t_location = item_doc.custom_default_stall_location

def validate(self):
    if self.purpose == "Material Transfer":
        for item in self.items:
            if item.s_warehouse != item.custom_default_store_warehouse:
                frappe.throw(_("Expecting source warehouse as {}".format(item.custom_default_store_warehouse)))
            
            if item.s_location != item.custom_default_store_location:
                frappe.msgprint(_("Expecting source location as {}".format(item.custom_default_store_location)))
