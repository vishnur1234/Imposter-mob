const AVATAR_IMAGES = [
  require("../../assets/avatars/bear.png"),
  require("../../assets/avatars/chicken.png"),
  require("../../assets/avatars/cool.png"),
  require("../../assets/avatars/dog.png"),
  require("../../assets/avatars/fox.png"),
  require("../../assets/avatars/girl.png"),
  require("../../assets/avatars/hippopotamus.png"),
  require("../../assets/avatars/lion.png"),
  require("../../assets/avatars/man.png"),
  require("../../assets/avatars/penguin.png"),
];

export const getPlayerAvatar = (name) => {
  if (!name) return AVATAR_IMAGES[2]; // Default to cool.png
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_IMAGES.length;
  return AVATAR_IMAGES[index];
};

export const getAvatarByIndex = (index) => {
  const safeIdx = Math.abs(parseInt(index) || 0) % AVATAR_IMAGES.length;
  return AVATAR_IMAGES[safeIdx];
};
