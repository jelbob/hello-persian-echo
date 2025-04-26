
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { serverUrl } = await req.json()
    
    if (!serverUrl) {
      throw new Error('Server URL is required')
    }

    // Fetch files from the server
    const response = await fetch(`${serverUrl}/files.json`)
    if (!response.ok) {
      throw new Error('Failed to fetch files from server')
    }

    const files = await response.json()

    // Process each file
    const processedFiles = files.map((file: { name: string, content?: string }) => {
      // Extract customer ID from first 16 characters
      const customerId = file.name.substring(0, 16)
      
      // Extract property from next 10 characters
      const property = file.name.substring(16, 26).trim()
      
      return {
        name: file.name,
        customerId,
        property,
        content: file.content
      }
    })

    console.log('Processed files:', processedFiles)

    return new Response(
      JSON.stringify({ files: processedFiles }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    )
  } catch (error) {
    console.error('Error in get-customer-files:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    )
  }
})
