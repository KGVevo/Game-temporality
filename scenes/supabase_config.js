
if (typeof supabase === 'undefined') {
    console.error("Error: El SDK de Supabase no se ha cargado.");
} else {
    const SUPABASE_URL = 'https://wuvziddaulkvngczgzki.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dnppZGRhdWxrdm5nY3pnemtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTY2NzIsImV4cCI6MjA3OTA3MjY3Mn0.ydZO7oBZaDgc8LHVcessF06LJ8WD_Aw-fvPg0mfnJWI';
    
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.userId = 'Phaser-User-' + crypto.randomUUID().substring(0, 6);
    
    console.log("Supabase Inicializado. UserID:", window.userId);
}
