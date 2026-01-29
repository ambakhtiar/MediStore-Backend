import { Category } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export class ServiceError extends Error {
    statusCode: number;
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ServiceError.prototype);
    }
}

type CreateDataType = {
    name: string;
    slug?: string | null;
    description?: string | null;
    isPrescriptionRequired?: boolean | null;
};

type UpdateDataType = Partial<CreateDataType>;

/** simple slugify helper */
const slugify = (s: string) =>
    s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\- ]+/g, "")
        .replace(/\s+/g, "-")
        .replace(/\-+/g, "-");

const ensureUniqueSlug = async (base: string) => {
    let candidate = base;
    let i = 1;
    // loop until unique
    while (true) {
        const exists = await prisma.category.findUnique({ where: { slug: candidate } });
        if (!exists) return candidate;
        candidate = `${base}-${i++}`;
    }
};

const getAllCategories = async (): Promise<Category[]> => {
    try {
        return await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
        });
    } catch (err) {
        console.error("getAllCategories error:", err);
        throw new ServiceError("Database error while fetching categories", 500);
    }
};

const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
        return await prisma.category.findUnique({ where: { id } });
    } catch (err) {
        console.error("getCategoryById error:", err);
        throw new ServiceError("Database error while fetching category", 500);
    }
};

const createCategory = async (data: CreateDataType): Promise<Category> => {
    const name = (data.name || "").trim();
    if (!name) throw new ServiceError("Name is required", 400);

    // normalize slug candidate
    const baseSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(name);

    try {
        const existingByName = await prisma.category.findUnique({ where: { name } });
        if (existingByName) {
            throw new ServiceError("Category with this name already exists", 409);
        }

        // ensure slug is unique
        const uniqueSlug = await ensureUniqueSlug(baseSlug);

        return await prisma.category.create({
            data: {
                name,
                slug: uniqueSlug,
                description: data.description ?? null,
                isPrescriptionRequired: data.isPrescriptionRequired ?? false
            },
        });
    } catch (err: any) {
        console.error("createCategory error:", err);

        // TODO : GLobal error hndler
        if (err?.code === "P2002" && Array.isArray(err?.meta?.target)) {
            const field = err.meta.target.join(", ");
            throw new ServiceError(`Duplicate value for unique field: ${field}`, 409);
        }
        throw new ServiceError("Database error while creating category", 500);
    }
};

const updateCategory = async (id: string, data: UpdateDataType): Promise<Category> => {
    try {
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) throw new ServiceError("Category not found", 404);

        // TODO: ERROR: Same name error

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description ?? null;

        if (data.slug !== undefined) {
            const baseSlug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(updateData.name ?? existing.name);

            // if slug changed, ensure uniqueness
            if (baseSlug !== existing.slug) {
                updateData.slug = await ensureUniqueSlug(baseSlug);
            } else {
                updateData.slug = existing.slug;
            }
        }

        return await prisma.category.update({
            where: { id },
            data: updateData,
        });
    } catch (err: any) {
        console.error("updateCategory error:", err);
        if (err instanceof ServiceError) throw err;
        if (err?.code === "P2002" && Array.isArray(err?.meta?.target)) {
            const field = err.meta.target.join(", ");
            throw new ServiceError(`Duplicate value for unique field: ${field}`, 409);
        }
        throw new ServiceError("Database error while updating category", 500);
    }
};

const deleteCategory = async (id: string): Promise<Category | null> => {
    try {
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) throw new ServiceError("Category not found", 404);

        return await prisma.category.delete({ where: { id } });
    } catch (err: any) {
        console.error("deleteCategory error:", err);
        if (err instanceof ServiceError) throw err;
        throw new ServiceError("Database error while deleting category", 500);
    }
};

export const categoryService = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};