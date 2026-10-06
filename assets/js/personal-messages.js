document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".pm-page");
  if (!page) return;
  const input = page.querySelector(".pm-message-input");
  const messages = page.querySelector(".pm-messages");
  const dialogs = [...page.querySelectorAll(".pm-dialog")];
  const histories = new Map([["anna", messages.cloneNode(true)]]);
  const drafts = new Map();
  let activeId = "anna";

  function createHistory(entries) {
    const history = messages.cloneNode(false);
    const date = document.createElement("div");
    date.className = "pm-date";
    const label = document.createElement("span");
    label.textContent = "Сегодня";
    date.append(label);
    history.append(date);
    entries.forEach(([direction, text, time]) => {
      const message = document.createElement("div");
      message.className = `pm-message ${direction}`;
      const bubble = document.createElement("div");
      bubble.className = "pm-bubble";
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      const timestamp = document.createElement("time");
      timestamp.className = "pm-message-time";
      timestamp.dateTime = `2026-10-07T${time}`;
      timestamp.textContent = time;
      bubble.append(paragraph);
      message.append(bubble, timestamp);
      history.append(message);
    });
    return history;
  }
  histories.set("dmitry", createHistory([
    ["incoming", "Здравствуйте! Хочу уточнить расписание.", "09:40"],
    ["incoming", "Подскажите, когда начинается занятие?", "09:42"],
  ]));
  histories.set("maria", createHistory([
    ["incoming", "Здравствуйте! Информация о занятиях уже доступна в расписании.", "08:15"],
    ["outgoing", "Спасибо за информацию!", "08:18"],
  ]));

  const emojiButton = page.querySelector("#pm-emoji-button");
  const supportIcon = document.querySelector("#emoji-picker-button svg");
  if (supportIcon) emojiButton.replaceChildren(supportIcon.cloneNode(true));
  const picker = document.createElement("div");
  picker.id = "pm-emoji-picker";
  picker.className = "pm-emoji-picker";
  picker.hidden = true;
  picker.setAttribute("role", "dialog");
  picker.setAttribute("aria-label", "Выбрать эмодзи");
  const heading = document.createElement("p");
  heading.textContent = "Эмодзи";
  const grid = document.createElement("div");
  grid.className = "pm-emoji-grid";
  let selectionStart = 0;
  let selectionEnd = 0;
  function saveSelection() {
    selectionStart = input.selectionStart ?? input.value.length;
    selectionEnd = input.selectionEnd ?? input.value.length;
  }
  ["select", "keyup", "click", "input", "blur"].forEach(type => input.addEventListener(type, saveSelection));
  function closePicker(restoreFocus = false) {
    picker.hidden = true;
    emojiButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) emojiButton.focus({ preventScroll: true });
  }
  const emojis = ["😄", "😂", "😊", "😍", "🥳", "😎", "🤩", "😺", "😮", "🤔", "😢", "🙌", "👍", "👎", "👏", "🙏", "🫶", "💙", "❤️", "🔥", "✨", "🎉", "✅", "📎", "📚", "🎓", "📅", "👋", "💬", "🌟", "☀️", "🌸"];
  emojis.forEach(emoji => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = emoji;
    button.setAttribute("aria-label", emoji);
    button.addEventListener("click", () => {
      input.setRangeText(emoji, selectionStart, selectionEnd, "end");
      saveSelection();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      closePicker();
      input.focus({ preventScroll: true });
    });
    grid.append(button);
  });
  picker.append(heading, grid);
  page.querySelector(".pm-composer").append(picker);
  emojiButton.addEventListener("click", () => {
    picker.hidden = !picker.hidden;
    emojiButton.setAttribute("aria-expanded", String(!picker.hidden));
    if (!picker.hidden) grid.querySelector("button").focus();
  });
  document.addEventListener("click", event => {
    if (!picker.contains(event.target) && !emojiButton.contains(event.target)) closePicker();
  });
  picker.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closePicker(true);
    }
  });

  const composer = page.querySelector(".pm-composer");
  const sendButton = page.querySelector(".pm-send-button");
  const originalSendLabel = sendButton.querySelector("span").textContent;
  const actionPreview = document.createElement("div");
  actionPreview.className = "pm-action-preview";
  actionPreview.hidden = true;
  const previewText = document.createElement("span");
  const cancelAction = document.createElement("button");
  cancelAction.type = "button";
  cancelAction.textContent = "×";
  cancelAction.setAttribute("aria-label", "Отменить действие");
  actionPreview.append(previewText, cancelAction);
  composer.prepend(actionPreview);
  let editingMessage = null;
  let reply = null;
  let draftBeforeEdit = "";

  function resetAction(restoreDraft = false) {
    if (editingMessage && restoreDraft) input.value = draftBeforeEdit;
    editingMessage = null;
    reply = null;
    actionPreview.hidden = true;
    sendButton.querySelector("span").textContent = originalSendLabel;
    sendButton.setAttribute("aria-label", "Отправить сообщение");
    saveSelection();
  }
  cancelAction.addEventListener("click", () => {
    resetAction(true);
    input.focus();
  });

  const contextMenu = document.createElement("div");
  contextMenu.className = "pm-context-menu";
  contextMenu.hidden = true;
  contextMenu.setAttribute("role", "menu");
  contextMenu.setAttribute("aria-label", "Действия с сообщением");
  document.body.append(contextMenu);
  let selectedMessage = null;
  function hideContextMenu(restoreFocus = false) {
    contextMenu.hidden = true;
    if (restoreFocus && selectedMessage?.isConnected) selectedMessage.focus({ preventScroll: true });
  }
  function messageText(message) {
    return message.querySelector(".pm-bubble p").textContent;
  }
  function runMessageAction(action) {
    const message = selectedMessage;
    hideContextMenu();
    if (!message?.isConnected) return;
    if (action === "delete") {
      if (editingMessage === message) resetAction(true);
      message.remove();
      input.focus();
      return;
    }
    resetAction(true);
    if (action === "reply") {
      reply = {
        name: message.classList.contains("outgoing") ? "Вы" : page.querySelector(".pm-contact-details h3").textContent,
        text: messageText(message),
      };
      previewText.textContent = `Ответ ${reply.name}: ${reply.text}`;
    } else {
      draftBeforeEdit = input.value;
      editingMessage = message;
      input.value = messageText(message);
      previewText.textContent = "Редактирование сообщения";
      sendButton.querySelector("span").textContent = "Сохранить";
      sendButton.setAttribute("aria-label", "Сохранить изменения");
    }
    actionPreview.hidden = false;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    saveSelection();
  }
  [["reply", "Ответить"], ["delete", "Удалить"], ["edit", "Изменить"]].forEach(([action, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.action = action;
    button.setAttribute("role", "menuitem");
    button.addEventListener("click", () => runMessageAction(action));
    contextMenu.append(button);
  });
  function showContextMenu(message, x, y) {
    closePicker();
    selectedMessage = message;
    message.tabIndex = -1;
    contextMenu.hidden = false;
    const bounds = contextMenu.getBoundingClientRect();
    contextMenu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - bounds.width - 8))}px`;
    contextMenu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - bounds.height - 8))}px`;
    contextMenu.querySelector("button").focus({ preventScroll: true });
  }
  messages.addEventListener("contextmenu", event => {
    const message = event.target.closest(".pm-message");
    if (!message || !messages.contains(message)) return;
    event.preventDefault();
    const bounds = message.getBoundingClientRect();
    showContextMenu(message, event.clientX || bounds.left, event.clientY || bounds.bottom);
  });
  contextMenu.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      hideContextMenu(true);
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const buttons = [...contextMenu.querySelectorAll("button")];
      const index = buttons.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 :
        (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus();
    }
    if (event.key === "Tab") hideContextMenu();
  });
  document.addEventListener("click", event => {
    if (!contextMenu.contains(event.target)) hideContextMenu();
  });
  document.addEventListener("scroll", () => hideContextMenu(), true);
  window.addEventListener("resize", () => hideContextMenu());
  sendButton.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    if (editingMessage) {
      editingMessage.querySelector(".pm-bubble p").textContent = text;
      resetAction();
      input.value = draftBeforeEdit;
    } else {
      const now = new Date();
      const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      const history = createHistory([["outgoing", text, time]]);
      const message = history.querySelector(".pm-message");
      message.querySelector("time").dateTime = now.toISOString();
      if (reply) {
        const quote = document.createElement("div");
        quote.className = "pm-reply";
        const author = document.createElement("strong");
        author.textContent = reply.name;
        const excerpt = document.createElement("span");
        excerpt.textContent = reply.text;
        quote.append(author, excerpt);
        message.prepend(quote);
      }
      messages.append(message);
      input.value = "";
      resetAction();
      const activeDialog = dialogs.find(dialog => dialog.dataset.dialog === activeId);
      activeDialog.querySelector(".pm-dialog-preview").textContent = `Вы отправили: ${text}`;
    }
    saveSelection();
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing && !event.repeat) {
      event.preventDefault();
      sendButton.click();
    }
    if (event.key === "Escape") resetAction(true);
  });

  // Each demo conversation keeps its own history and unsent draft.
  dialogs.forEach(dialog => dialog.querySelector("a").addEventListener("click", event => {
    event.preventDefault();
    const id = dialog.dataset.dialog;
    if (id === activeId) return;
    hideContextMenu();
    resetAction(true);
    histories.set(activeId, messages.cloneNode(true));
    drafts.set(activeId, input.value);
    activeId = id;
    dialogs.forEach(item => {
      const selected = item === dialog;
      item.classList.toggle("active", selected);
      if (selected) item.querySelector("a").setAttribute("aria-current", "true");
      else item.querySelector("a").removeAttribute("aria-current");
    });
    dialog.classList.remove("unread");
    dialog.querySelector(".pm-unread-count")?.remove();
    page.querySelector(".pm-contact-details h3").textContent = dialog.querySelector(".pm-dialog-name").textContent;
    const avatar = dialog.querySelector(".pm-avatar").cloneNode(true);
    avatar.classList.add("pm-avatar-small");
    page.querySelector(".pm-contact .pm-avatar").replaceWith(avatar);
    const status = dialog.querySelector(".pm-status").cloneNode(true);
    page.querySelector(".pm-contact .pm-status").replaceWith(status);
    const online = status.classList.contains("online");
    const statusText = page.querySelector(".pm-contact-details p");
    statusText.textContent = online ? "В сети" : "Не в сети";
    statusText.style.color = online ? "#28a745" : "#6b7d94";
    messages.replaceChildren(...[...histories.get(id).childNodes].map(node => node.cloneNode(true)));
    input.value = drafts.get(id) || "";
    selectionStart = selectionEnd = input.value.length;
    const typing = page.querySelector(".pm-typing");
    typing.hidden = id !== "anna";
    closePicker();
    messages.scrollTop = messages.scrollHeight;
  }));
});
