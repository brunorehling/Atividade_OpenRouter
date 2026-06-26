-- CreateTable
CREATE TABLE "Requisito" (
    "id" SERIAL NOT NULL,
    "ideiaOriginal" TEXT NOT NULL,
    "funcionalidades" JSONB NOT NULL,
    "atores" JSONB NOT NULL,
    "regrasDeNegocio" JSONB NOT NULL,
    "riscos" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Requisito_pkey" PRIMARY KEY ("id")
);
