const fs = require('fs');
const path = require('path');

const actionPath = path.join(__dirname, '../src/actions/katar.ts');
let acContent = fs.readFileSync(actionPath, 'utf8');
acContent = acContent.replace('import { getUserSettings } from "@/lib/auth";', 'import { getServerSession } from "next-auth";\nimport { authOptions } from "@/lib/auth";');
acContent = acContent.replace(/getUserSettings\(\)/g, 'getServerSession(authOptions)');
acContent = acContent.replace(/user\.tenantId/g, 'user?.user?.tenantId');
fs.writeFileSync(actionPath, acContent);

const invPath = path.join(__dirname, '../src/components/dashboard/roles/katar/KatarInventory.tsx');
let invContent = fs.readFileSync(invPath, 'utf8');
invContent = invContent.replace('import React, { useState } from "react";', 'import React, { useState, useEffect } from "react";\nimport { getKatarInventories, addKatarInventory, deleteKatarInventory } from "@/actions/katar";');
fs.writeFileSync(invPath, invContent);

console.log("Fixed errors");
