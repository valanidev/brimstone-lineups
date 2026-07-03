CREATE TABLE "lineups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"map" varchar(100) NOT NULL,
	"site" varchar(10) NOT NULL,
	"difficulty" varchar(50) NOT NULL,
	"tags" text[] NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"travel_time" real NOT NULL,
	"marker_x" real,
	"marker_y" real,
	"created_at" timestamp DEFAULT now() NOT NULL
);
