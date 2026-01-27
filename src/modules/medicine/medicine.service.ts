import { Medicine } from "../../generated/prisma/client"
import { prisma } from "../../lib/prisma"

const postMedicine = async (data: Medicine) => {
    const result = await prisma.medicine.create({
        data,
    })
    return result;
}

const getAllMedicines = async () => {
    const result = await prisma.medicine.findMany();
    return result;
}

export const medicineService = {
    postMedicine,
    getAllMedicines
}