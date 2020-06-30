'use strict';

var tables = {
	users : (
		"CREATE TABLE `users` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20) NOT NULL," +
		" `first_name` varchar(25) NOT NULL," +
		" `last_name` varchar(25) NOT NULL," + 
		" `email` varchar(60) NOT NULL," +
		" `password` varchar(100) NOT NULL," +
		" `pro_pic` varchar(250)," +
		" `verified` int(2) NOT NULL DEFAULT 0," +
		" `admin` int (1) NOT NULL DEFAULT 0," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	profiles : (
		"CREATE TABLE `profiles` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20) NOT NULL," +
		" `age` varchar(3)," +
		" `gender` varchar(25) NOT NULL," +
		" `orientation` varchar(25) NOT NULL," +
		" `preference` varchar(25) NOT NULL," +
		" `interests` varchar(140) NOT NULL," +
		" `city` varchar(42) NOT NULL," +
		" `country` varchar(42) NOT NULL," +
		" `bio` varchar(140)," +
		" `popularity` int (2) NOT NULL DEFAULT 0," +
		" `suspended` int (1) NOT NULL DEFAULT 0," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	interests : (
		"CREATE TABLE `interests` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `interest` varchar(20) NOT NULL," +
		" `user_list` varchar(400)," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	likes : (
		"CREATE TABLE `likes` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20) NOT NULL," +
		" `liked` varchar(20) NOT NULL," +
		" `lovers` int (1) NOT NULL DEFAULT 0," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	blocked : (
		"CREATE TABLE `blocked` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20) NOT NULL," +
		" `blocker` varchar(20) NOT NULL," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	visits : (
		"CREATE TABLE `visits` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `visitor` varchar(20) NOT NULL," +
		" `visited` varchar(20) NOT NULL," +
		" `year` int(4) NOT NULL," +
		" `month` int(2) NOT NULL," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	images : (
		"CREATE TABLE `images` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20) NOT NULL," +
		" `img_src` varchar(250) NOT NULL," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	tokens : (
		"CREATE TABLE `tokens` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20)," +
		" `type` varchar(20) NOT NULL," +
		" `token` varchar(250) NOT NULL," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	geolocation : (
		"CREATE TABLE `geolocation` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20) NOT NULL," +
		" `latitude` DECIMAL(6, 4)," +
		" `longitude` DECIMAL(6, 4)," +
		" `city` varchar(42)," +
		" `country` varchar(42)," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	test : (
		"CREATE TABLE `test` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `username` varchar(20) NOT NULL," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
	places : (
		"CREATE TABLE `places` (" +
		" `id` int(11) NOT NULL AUTO_INCREMENT," +
		" `latitude` DECIMAL(6, 4)," +
		" `longitude` DECIMAL(6, 4)," +
		" `city` varchar(42) NOT NULL," +
		" `country` varchar(42) NOT NULL," +
		" PRIMARY KEY (`id`)" +
		") ENGINE=InnoDB"
	),
}

module.exports = tables;
