import ContactMessage, { type ContactMessageProps } from "./contact-message";

export default function ContactReceipt(props: ContactMessageProps) {
  return <ContactMessage {...props} audience="client" replyEmail={props.replyEmail ?? ContactReceipt.PreviewProps.replyEmail} />;
}

ContactReceipt.PreviewProps = {
  ...ContactMessage.PreviewProps,
  replyEmail: "hello@example.com",
};
