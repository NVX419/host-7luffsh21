
module.exports = {
  PREFIX: '*', // برفيكس
  CHANNEL_ID: '', // ايدي الروم 
  BYPASS_ROLE_ID: '', // ايدي الروتبه ال بتتخطي  الكول دون 
  BOT_TOKEN: '', // توكن البوت
   TOKEN_LIST: ['', '', ''], // توكنات الحسابات
  EMBED_COLOR: 0x00ff00, // لون الامبيد
  COOLDOWN_CHECK: '150s', 
  COOLDOWN_CHECKUSERNAME: '59s', // وقت  لأمر checkusername
  BUTTON_COLLECTOR_TIMEOUT: 15 * 60 * 1000, // وقت انتهاء جمع الأزرار (15 دقيقة)
  COMMAND_CHECK: 'cc', //check
  COMMAND_CHECKUSERNAME: 'nn', //checkusername
  LANGUAGE: 'en', // اللغة (en or ar)
  MESSAGES: {
    en: {
      EMBED_TITLE_COOLDOWN: 'Cooldown Active',
      EMBED_COOLDOWN_MESSAGE: 'Please wait',
      EMBED_TITLE_ERROR: 'Error',
      EMBED_ERROR_NO_USERNAME: 'Please provide a username to check. Usage: `?check <username>`',
      EMBED_TITLE_CHECKING: 'Checking Username...',
      EMBED_CHECKING_MESSAGE: 'Please wait...',
      EMBED_TITLE_AVAILABILITY: 'Username Availability',
      EMBED_AVAILABLE_MESSAGE: '**{username}** is available!',
      EMBED_TAKEN_MESSAGE: '**{username}** is taken.',
      EMBED_TITLE_INVALID_PREFIX: 'Invalid Prefix',
      EMBED_INVALID_PREFIX_MESSAGE: 'Prefix must be 0–3 characters long and contain only lowercase letters, digits, underscores, or periods.',
      EMBED_TITLE_GENERATING: 'Username Generator',
      EMBED_GENERATING_MESSAGE: 'Generating usernames, please wait...',
      EMBED_BUTTON_NOT_AUTHOR: 'This button is only for the command initiator.',
      BUTTON_CHECK_ALL_LABEL: 'Check All',
      EMBED_NO_USERNAMES: 'No usernames generated.',
    },
    ar: {
      EMBED_TITLE_COOLDOWN: 'التهدئة نشطة',
      EMBED_COOLDOWN_MESSAGE: 'يرجى الانتظار',
      EMBED_TITLE_ERROR: 'خطأ',
      EMBED_ERROR_NO_USERNAME: 'يرجى تقديم اسم مستخدم للتحقق. الاستخدام: `?check <اسم المستخدم>`',
      EMBED_TITLE_CHECKING: 'جارٍ التحقق من اسم المستخدم...',
      EMBED_CHECKING_MESSAGE: 'يرجى الانتظار...',
      EMBED_TITLE_AVAILABILITY: 'توفر اسم المستخدم',
      EMBED_AVAILABLE_MESSAGE: '**{username}** متاح!',
      EMBED_TAKEN_MESSAGE: '**{username}** مستخدم.',
      EMBED_TITLE_INVALID_PREFIX: 'بادئة غير صالحة',
      EMBED_INVALID_PREFIX_MESSAGE: 'يجب أن تكون البادئة من 0 إلى 3 أحرف وتحتوي فقط على أحرف صغيرة، أرقام، شرطات سفلية، أو نقاط.',
      EMBED_TITLE_GENERATING: 'مولد أسماء المستخدمين',
      EMBED_GENERATING_MESSAGE: 'جارٍ إنشاء أسماء المستخدمين، يرجى الانتظار...',
      EMBED_BUTTON_NOT_AUTHOR: 'هذا الزر مخصص فقط لمن بدأ الأمر.',
      BUTTON_CHECK_ALL_LABEL: 'التحقق من الكل',
      EMBED_NO_USERNAMES: 'لم يتم إنشاء أسماء مستخدمين.',
    },
  },
};