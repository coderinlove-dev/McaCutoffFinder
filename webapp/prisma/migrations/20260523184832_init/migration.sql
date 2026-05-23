-- CreateTable
CREATE TABLE "pdf_sources" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "source_label" TEXT,
    "course_name" TEXT,
    "academic_year" TEXT,
    "cap_round" INTEGER,
    "candidate_scope" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "pdf_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutes" (
    "id" SERIAL NOT NULL,
    "institute_code" TEXT NOT NULL,
    "institute_name" TEXT NOT NULL,

    CONSTRAINT "institutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cutoff_rows" (
    "id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "institute_id" INTEGER NOT NULL,
    "academic_year" TEXT,
    "cap_round" INTEGER,
    "candidate_type" TEXT,
    "category" TEXT,
    "seat_type" TEXT,
    "university_type" TEXT,
    "cutoff_value" DOUBLE PRECISION,
    "cutoff_unit" TEXT,
    "raw_row_text" TEXT,
    "page_number" INTEGER,
    "row_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cutoff_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pdf_sources_file_name_key" ON "pdf_sources"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "institutes_institute_code_key" ON "institutes"("institute_code");

-- CreateIndex
CREATE UNIQUE INDEX "cutoff_rows_row_hash_key" ON "cutoff_rows"("row_hash");

-- AddForeignKey
ALTER TABLE "cutoff_rows" ADD CONSTRAINT "cutoff_rows_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "pdf_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cutoff_rows" ADD CONSTRAINT "cutoff_rows_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "institutes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
