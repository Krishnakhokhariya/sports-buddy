import { useState } from "react";
import Popup from "../components/Popup";

export default function usePopup() {
  const [popup, setPopup] = useState(null);
  const [resolver, setResolver] = useState(null);

  function showPopup(message) {
    return new Promise((resolve) => {
      setPopup({ message, type: "alert" });
      setResolver(() => resolve);
    });
  }

  function showConfirm(message) {
    return new Promise((resolve) => {
      setPopup({ message, type: "confirm" });
      setResolver(() => resolve);
    });
  }

  function handleClose(result) {
    setPopup(null);
    if (resolver) resolver(result);
  }

  const popupElement = popup ? (
    <Popup
      message={popup.message}
      type={popup.type}
      onClose={() => handleClose(true)}
      onCancel={() => handleClose(false)}
    />
  ) : null;

  return { showPopup, showConfirm, popupElement };
}
