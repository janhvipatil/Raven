# Copyright (c) 2023, Janhvi Patil and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RavenMessage(Document):

    def validate(self):
        # If the user is not the owner of the message, do not allow them to create/modify it
        if self.owner != frappe.session.user:
            frappe.throw(
                "You don't have permission to modify this message", frappe.PermissionError)

    def after_delete(self):
        frappe.publish_realtime('message_deleted', {
            'channel_id': self.channel_id}, after_commit=True)
        frappe.db.commit()

    def on_update(self):
        frappe.publish_realtime('message_updated', {
            'channel_id': self.channel_id}, after_commit=True)
        frappe.db.commit()


@frappe.whitelist(methods=['POST'])
def send_message(channel_id, text):
    doc = frappe.get_doc({
        'doctype': 'Raven Message',
        'channel_id': channel_id,
        'text': text,
        'message_type': 'Text'
    })
    doc.insert()
    return "message sent"
