import { NextRequest, NextResponse } from "next/server";
import connectDB from '@/db/mongodb';
import { PlatformSettings } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

let platformSettings = {
  general: {
    siteName: "DigiVerse",
    siteDescription: "Your trusted marketplace for premium digital products",
    siteEmail: "support@digiverse.com",
    siteUrl: "https://digiverse.com",
    timezone: "UTC",
    currency: "USD",
    maintenanceMode: false,
  },
  commission: {
    defaultRate: 15,
    minWithdrawal: 50,
  },
  notifications: {
    newUserEmail: true,
    newProductEmail: true,
    newOrderEmail: true,
    withdrawalEmail: true,
  },
  security: {
    maintenanceMode: false,
    requireEmailVerification: false,
    autoApproveProducts: false,
  },
  whatsapp: {
    enabled: false,
    phoneNumber: "",
    defaultMessage: "Hello! How can we help you today?",
    businessHours: "9 AM - 6 PM"
  },
  paymentMethods: {
    stripe: { 
      enabled: true, 
      label: "Stripe", 
      description: "Pay with Credit/Debit Card",
      publishableKey: "",
      secretKey: "",
      webhookSecret: ""
    },
    jazzcash: { 
      enabled: true, 
      label: "JazzCash", 
      description: "Pay with JazzCash Mobile Account",
      merchantId: "",
      password: "",
      integritySalt: "",
      accountNumber: ""
    },
    easypaisa: { 
      enabled: true, 
      label: "Easypaisa", 
      description: "Pay with Easypaisa Mobile Account",
      storeId: "",
      storePassword: "",
      accountNumber: ""
    },
    nayapay: { 
      enabled: true, 
      label: "NayaPay", 
      description: "Pay with NayaPay Digital Wallet",
      apiKey: "",
      secretKey: "",
      accountNumber: ""
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get("authorization");
    const isAuthenticated = authHeader?.startsWith("Bearer ");
    
    const dbSettings = await PlatformSettings.find({});
    
    const settingsObj: any = {};
    dbSettings.forEach(setting => {
      settingsObj[setting.category] = setting.settings;
    });

    const finalSettings = { ...platformSettings, ...settingsObj };

    if (!isAuthenticated) {
      return NextResponse.json({ 
        settings: { 
          whatsapp: finalSettings.whatsapp,
          paymentMethods: finalSettings.paymentMethods
        } 
      });
    }

    try {
      await requireRole(request, ['admin']);
      return NextResponse.json({ settings: finalSettings });
    } catch (error) {
      return NextResponse.json({ 
        settings: { 
          whatsapp: finalSettings.whatsapp,
          paymentMethods: finalSettings.paymentMethods
        } 
      });
    }
  } catch (error: any) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await requireRole(request, ['admin']);

    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings) {
      return NextResponse.json(
        { error: "Category and settings are required" },
        { status: 400 }
      );
    }

    const validCategories = ['general', 'commission', 'notifications', 'security', 'whatsapp', 'paymentMethods'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Find or create setting
    let platformSetting = await PlatformSettings.findOne({ category });

    if (platformSetting) {
      // Update existing
      platformSetting.settings = { ...platformSetting.settings, ...settings };
      platformSetting.updatedAt = new Date();
      platformSetting.updatedBy = user.id;
      await platformSetting.save();
    } else {
      // Create new
      const lastSetting = await PlatformSettings.findOne().sort({ settingId: -1 });
      const settingId = lastSetting ? lastSetting.settingId + 1 : 1;
      
      platformSetting = await PlatformSettings.create({
        category,
        settings,
        updatedAt: new Date(),
        updatedBy: user.id,
        settingId
      });
    }

    // Update in-memory cache
    platformSettings[category as keyof typeof platformSettings] = platformSetting.settings;

    // Fetch all updated settings
    const allSettings = await PlatformSettings.find({});
    const settingsObj: any = {};
    allSettings.forEach(setting => {
      settingsObj[setting.category] = setting.settings;
    });
    const finalSettings = { ...platformSettings, ...settingsObj };

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: finalSettings,
    });
  } catch (error: any) {
    console.error("Settings update error:", error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}