// Synthetic preview facts only; never a projection of an account or a billing claim.
export const previewProjects = [
  {name: "studio", status: "inProgress", hours: 12, minutes: 30},
  {name: "api", status: "ready", hours: 8, minutes: 15},
  {name: "review", status: "planned", hours: 2, minutes: 0},
] as const;
export const previewTasks = [
  {name: "taskOne", done: true},
  {name: "taskTwo", done: true},
  {name: "taskThree", done: false},
] as const;
export const previewInvoiceAmount = 1250;
