CREATE TABLE `image_tags` (
  `tag_id` int(11) DEFAULT NULL,
  `wallpaper_id` VARCHAR(16) DEFAULT NULL,
  `added_by` VARCHAR(32),
  `added_on` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1