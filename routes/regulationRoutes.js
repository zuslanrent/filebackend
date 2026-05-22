const express = require("express");
const {
  getRegulations,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
} = require("../controllers/regulationController");
const { upload } = require("../config/cloudinary");
const { pool } = require("../config/db");

const router = express.Router();

router.get("/", getRegulations);
router.get("/:uuid", getRegulationById);
router.post("/", createRegulation);
router.put("/:uuid", updateRegulation);
router.delete("/:uuid", deleteRegulation);

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Файл байхгүй байна." })
    }

    const {
      name, group_name, division_name,
      description, approved_date, uploaded_by, uploaded_by_name,
    } = req.body

    let view_permissions = []
    let download_permissions = []
    try {
      view_permissions     = JSON.parse(req.body.view_permissions || '[]')
      download_permissions = JSON.parse(req.body.download_permissions || '[]')
    } catch {
      view_permissions     = []
      download_permissions = []
    }

    console.log('Upload request:', { name, group_name, division_name, view_permissions_count: view_permissions.length })

    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase() || 'file'

    const result = await pool.query(
      `INSERT INTO regulations 
        (file_name, file_url, file_size, file_type, status, group_name, division_name, 
         description, approved_date, uploaded_by, uploaded_by_name,
         view_permissions, download_permissions, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING *`,
      [
        name || req.file.originalname,
        req.file.path,
        req.file.size,
        fileExtension,
        'active',
        group_name || null,
        division_name || null,
        description || null,
        approved_date || null,
        uploaded_by || null,
        uploaded_by_name || null,
        view_permissions,
        download_permissions,
      ]
    )

    res.json({ success: true, data: result.rows[0] })
  } catch (error) {
    console.error('Upload error details:', error)
    return res.status(500).json({ success: false, message: error.message, detail: error.detail })
  }
})

router.use((err, req, res, next) => {
  console.error("Multer/Cloudinary error:", err);
  return res.status(500).json({ success: false, message: err.message || "Upload failed" });
});

module.exports = router;