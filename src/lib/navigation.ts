// Where the "Back" button goes when there is no browser history to go back to
// (for example when a page was opened from a link or after a refresh).
export function parentPath(pathname: string): string {
  const [first, id] = pathname.split("/").filter(Boolean);
  switch (first) {
    case "compare":
      return id ? `/medicine/${id}` : "/home"; // options → that medicine
    case "checkout":
      return "/cart";
    case "track":
    case "order":
      return "/orders"; // tracking and order details → my orders
    default:
      return "/home"; // medicine, cart and everything else
  }
}

// The welcome page and home are the start of the app, so they have no Back button.
export function showBackButton(pathname: string): boolean {
  return pathname !== "/" && pathname !== "/home";
}
