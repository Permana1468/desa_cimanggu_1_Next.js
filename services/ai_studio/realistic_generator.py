#!/usr/bin/env python3
"""
=============================================================================
Sistem Digitalisasi Desa Cimanggu I - AI Studio Generator Engine
Realistic Image Generator powered by Google Gemini AI & Python
Penulis: MUHAMAD ALDIANSYAH & Antigravity Agent
=============================================================================
"""

import sys
import json
import base64
import os
import urllib.request
import urllib.error
import ssl

# Realistic Prompt Enhancers
ENHANCERS = {
    "product": (
        "Commercial studio product photography, clean professional lighting, "
        "8k UHD, crisp textures, depth of field, sharp focus, advertising standard, "
        "shot on Hasselblad H6D-100c, softbox lighting."
    ),
    "fashion": (
        "High-end fashion editorial photography, Indonesian aesthetic, elegant styling, "
        "natural fabric texture, professional model, cinematic studio lighting, "
        "Vogue magazine aesthetic, 8k resolution, photorealistic."
    ),
    "prewedding": (
        "Romantic Indonesian prewedding photography, realistic Indonesian couple, "
        "authentic luxury cultural attire (Kebaya/Beskap or modern bridal wear), "
        "golden hour cinematic lighting, lush scenic background, 85mm portrait lens, "
        "hyper-realistic facial likeness, tender emotions, 8k masterpiece."
    ),
    "model": (
        "Ultra-realistic portrait of an Indonesian person, natural skin pore texture, "
        "expressive eyes, cinematic studio lighting, 85mm f/1.4 lens bokeh, "
        "hyper-detailed, photorealistic, professional color grading."
    ),
    "photographer_passport": (
        "Official formal Indonesian passport/ID card photograph, perfectly centered portrait, "
        "formal collared attire / Indonesian civil batik, neutral confident expression, "
        "standard studio lighting, high resolution, sharp details."
    ),
    "photographer_umrah": (
        "Heartwarming realistic photo of Indonesian pilgrims in Holy Mecca/Medina, "
        "authentic Ihram or modest Muslim attire, Masjidil Haram background with Kaaba or Nabawi, "
        "radiant peaceful expression, natural daylight, 8k documentary style."
    ),
    "photographer_baby": (
        "Adorable newborn/toddler photography, gentle soft lighting, cozy blankets, "
        "innocent cute expression, pastel tones, studio quality, heartwarming."
    ),
    "architecture_interior": (
        "Photorealistic modern interior architectural render, Indonesian village hall meeting room "
        "or contemporary minimalist living space, warm ambient lighting, fine wood accents, "
        "spacious, 8k architectural visualization, ArchDaily quality."
    ),
    "architecture_exterior": (
        "Architectural exterior photograph of an Indonesian modern village hall (Kantor Desa) "
        "or modern tropical village house, lush tropical greenery, blue sky with soft clouds, "
        "realistic building materials, accurate shadows, 8k drone/eye-level perspective."
    ),
    "sketch_to_photo": (
        "Transform hand-drawn architectural sketch/concept into an ultra-realistic 3D finished photograph, "
        "realistic textures, physically accurate lighting, real-world materials, 8k render."
    ),
    "art_caricature": (
        "High quality 3D animated character caricature (Pixar/Disney aesthetic), "
        "recognize and preserve original facial characteristics and distinct features, "
        "vibrant colors, smooth 3D render, joyful and professional."
    ),
    "edit_restore": (
        "Ultra-high restoration, remove blur, enhance facial details, fix lighting and contrast, "
        "natural sharp skin texture, photorealistic clarity, 8k output."
    ),
    "banner": (
        "Professional Indonesian village community banner design, modern graphic layout, "
        "clean typography, vivid colors, inspiring government and community theme, high resolution."
    ),
    "general": (
        "Photorealistic, hyper-detailed, 8k resolution, professional photography, natural lighting."
    )
}

def enhance_prompt(base_prompt, mode="general", custom_instruction=""):
    enhancer = ENHANCERS.get(mode, ENHANCERS["general"])
    parts = []
    
    if base_prompt:
        parts.append(base_prompt.strip())
        
    parts.append(enhancer)
    
    if custom_instruction:
        parts.append(f"Additional details: {custom_instruction.strip()}")
        
    parts.append("CRITICAL: Photorealistic quality, high fidelity, avoid artificial deformities, perfectly rendered hands and facial features.")
    
    return " ".join(parts)

def call_gemini_api(api_key, model, payload):
    """
    Calls Google Gemini API using native urllib for zero-dependency reliability.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    data = json.dumps(payload).encode("utf-8")
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
            resp_body = resp.read().decode("utf-8")
            return json.loads(resp_body)
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_msg)
            return {"error": err_json.get("error", {}).get("message", err_msg), "status": e.code}
        except Exception:
            return {"error": f"HTTP {e.code}: {err_msg}", "status": e.code}
    except Exception as e:
        return {"error": str(e), "status": 500}

def main():
    # Read payload from stdin or argument
    try:
        if len(sys.argv) > 1 and sys.argv[1] == "--json":
            input_data = json.loads(sys.argv[2])
        else:
            input_text = sys.stdin.read().strip()
            if input_text:
                input_data = json.loads(input_text)
            else:
                input_data = {}
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)

    api_key = input_data.get("apiKey", "")
    mode = input_data.get("mode", "general")
    user_prompt = input_data.get("prompt", "")
    custom_instruction = input_data.get("customInstruction", "")
    aspect_ratio = input_data.get("aspectRatio", "1:1")
    image_base64 = input_data.get("imageBase64", "")
    mime_type = input_data.get("mimeType", "image/jpeg")
    
    # If API key is empty, check environment
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
        
    if not api_key:
        print(json.dumps({
            "success": False, 
            "error": "API Key Gemini tidak ditemukan. Kunci API harus dikonfigurasi melalui Admin Master."
        }))
        sys.exit(1)

    final_prompt = enhance_prompt(user_prompt, mode, custom_instruction)

    # Build multimodal parts
    parts = [{"text": final_prompt}]
    
    if image_base64:
        # Strip header if present (data:image/...;base64,)
        if "," in image_base64:
            header, image_base64 = image_base64.split(",", 1)
            if "image/png" in header:
                mime_type = "image/png"
            elif "image/webp" in header:
                mime_type = "image/webp"
            elif "image/jpeg" in header or "image/jpg" in header:
                mime_type = "image/jpeg"
                
        parts.append({
            "inlineData": {
                "mimeType": mime_type,
                "data": image_base64.strip()
            }
        })

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {
                "aspectRatio": aspect_ratio
            }
        }
    }

    # Model priority list
    models_to_try = [
        "gemini-2.5-flash-image",
        "gemini-2.5-flash-image-preview",
        "imagen-3.0-generate-002",
        "gemini-2.0-flash-exp"
    ]

    last_error = None
    for model_name in models_to_try:
        res = call_gemini_api(api_key, model_name, payload)
        
        if "error" not in res:
            # Check for inlineData
            candidates = res.get("candidates", [])
            if candidates:
                cand_parts = candidates[0].get("content", {}).get("parts", [])
                for part in cand_parts:
                    if "inlineData" in part:
                        out_data = part["inlineData"]["data"]
                        out_mime = part["inlineData"].get("mimeType", "image/png")
                        image_url = f"data:{out_mime};base64,{out_data}"
                        
                        print(json.dumps({
                            "success": True,
                            "imageUrl": image_url,
                            "mode": mode,
                            "modelUsed": model_name,
                            "aspectRatio": aspect_ratio,
                            "promptEnhanced": final_prompt
                        }))
                        return

            last_error = "Tidak ada data gambar yang dikembalikan dari Gemini API."
        else:
            # If 404, try next model
            if res.get("status") == 404:
                last_error = res.get("error")
                continue
            else:
                last_error = res.get("error")
                break

    print(json.dumps({
        "success": False,
        "error": last_error or "Gagal membuat gambar dengan AI. Coba gunakan deskripsi yang lebih spesifik.",
        "mode": mode
    }))

if __name__ == "__main__":
    main()
