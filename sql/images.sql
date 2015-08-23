CREATE TABLE `images` (
  `id` varchar(16) NOT NULL,
  `date_uploaded` datetime DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int(6) DEFAULT NULL,
  `path` varchar(3000) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1