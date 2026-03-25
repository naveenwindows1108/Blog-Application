import { useEffect } from "react";

export function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    document.title = `${pageTitle} | Scriptly`;

    return () => {
      document.title = "Scriptly";
    };
  }, [pageTitle]);
}
