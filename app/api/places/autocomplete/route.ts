import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const input = url.searchParams.get('input');
  if (!input) {
    return NextResponse.json({ predictions: [] });
  }
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    console.error('Google Maps API key not configured');
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${key}`
    );
    const data = await res.json();
    return NextResponse.json({ predictions: data.predictions || [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }
}
