import { createCardElement, deleteCard, likeCard } from "./components/card.js"
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js"
import { enableValidation, clearValidation } from "./components/validation.js"
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  deleteCardAPI,
  changeLikeCardStatus,
} from "./components/api.js"

const placesWrap = document.querySelector(".places__list")
const profileFormModalWindow = document.querySelector(".popup_type_edit")
const profileForm = profileFormModalWindow.querySelector(".popup__form")
const profileTitleInput = profileForm.querySelector(".popup__input_type_name")
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description")

const cardFormModalWindow = document.querySelector(".popup_type_new-card")
const cardForm = cardFormModalWindow.querySelector(".popup__form")
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name")
const cardLinkInput = cardForm.querySelector(".popup__input_type_url")

const imageModalWindow = document.querySelector(".popup_type_image")
const imageElement = imageModalWindow.querySelector(".popup__image")
const imageCaption = imageModalWindow.querySelector(".popup__caption")

const openProfileFormButton = document.querySelector(".profile__edit-button")
const openCardFormButton = document.querySelector(".profile__add-button")

const profileTitle = document.querySelector(".profile__title")
const profileDescription = document.querySelector(".profile__description")
const profileAvatar = document.querySelector(".profile__image")

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar")
const avatarForm = avatarFormModalWindow.querySelector(".popup__form")
const avatarInput = avatarForm.querySelector(".popup__input")

const confirmModalWindow = document.querySelector(".popup_type_remove-card")
const confirmForm = confirmModalWindow.querySelector(".popup__form")

let currentUserId
let cardToDelete = null
let cardIdToDelete = null

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link
  imageElement.alt = name
  imageCaption.textContent = name
  openModalWindow(imageModalWindow)
}

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault()
  setUserInfo({
    name: profileTitleInput.value.trim(),
    about: profileDescriptionInput.value.trim(),
  })
    .then((userData) => {
      profileTitle.textContent = userData.name
      profileDescription.textContent = userData.about
      closeModalWindow(profileFormModalWindow)
    })
    .catch((err) => {
      console.log(err)
    })
}

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault()
  setUserAvatar({
    avatar: avatarInput.value.trim(),
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`
      avatarForm.reset()
      clearValidation(avatarForm, validationSettings)
      closeModalWindow(avatarFormModalWindow)
    })
    .catch((err) => {
      console.log(err)
    })
}

const handleDeleteCard = (cardElement, cardId) => {
  cardToDelete = cardElement
  cardIdToDelete = cardId
  openModalWindow(confirmModalWindow)
}

confirmForm.addEventListener("submit", (evt) => {
  evt.preventDefault()

  if (!cardToDelete || !cardIdToDelete) return

  deleteCardAPI(cardIdToDelete)
    .then(() => {
      deleteCard(cardToDelete)
      closeModalWindow(confirmModalWindow)
      cardToDelete = null
      cardIdToDelete = null
    })
    .catch((err) => {
      console.log(err)
    })
})

const handleLikeCard = (cardElement, cardId) => {
  const likeButton = cardElement.querySelector(".card__like-button")
  const likeCount = cardElement.querySelector(".card__like-count")
  const isLiked = likeButton.classList.contains("card__like-button_is-active")

  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      likeButton.classList.toggle("card__like-button_is-active")
      likeCount.textContent = cardData.likes.length
    })
    .catch((err) => {
      console.log(err)
    })
}

const handleCardFormSubmit = (evt) => {
  evt.preventDefault()
  addNewCard({
    name: cardNameInput.value.trim(),
    link: cardLinkInput.value.trim(),
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          currentUserId,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          }
        )
      )
      cardForm.reset()
      clearValidation(cardForm, validationSettings)
      closeModalWindow(cardFormModalWindow)
    })
    .catch((err) => {
      console.log(err)
    })
}

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
}

enableValidation(validationSettings)

profileForm.addEventListener("submit", handleProfileFormSubmit)
cardForm.addEventListener("submit", handleCardFormSubmit)
avatarForm.addEventListener("submit", handleAvatarFormSubmit)

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent
  profileDescriptionInput.value = profileDescription.textContent
  clearValidation(profileForm, validationSettings)
  openModalWindow(profileFormModalWindow)
})

profileAvatar.addEventListener("click", () => {
  avatarForm.reset()
  clearValidation(avatarForm, validationSettings)
  openModalWindow(avatarFormModalWindow)
})

openCardFormButton.addEventListener("click", () => {
  cardForm.reset()
  clearValidation(cardForm, validationSettings)
  openModalWindow(cardFormModalWindow)
})

const allPopups = document.querySelectorAll(".popup")
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup)
})

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    profileTitle.textContent = userData.name
    profileDescription.textContent = userData.about
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`
    currentUserId = userData._id

    cards.forEach((data) => {
      placesWrap.append(
        createCardElement(data, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        })
      )
    })
  })
  .catch((err) => {
    console.log(err)
  })