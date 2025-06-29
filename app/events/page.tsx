"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import PageSkeleton from "@/components/PageSkeleton";
import { useApi } from "@/lib/useApi";
import { useTranslation } from "react-i18next";
import VirtualResponsiveGrid from "@/components/VirtualList";
import { FilterBar } from "@/components/FilterBar";
import { Input } from "@/components/ui/input";
import { PullToRefreshWrapper } from "@/components/PullToRefreshWrapper";

interface EventItem {
  id: string;
  name: string;
  status: string;
  clubName?: string | null;
  registrationEndTime?: string;
  createdAt: string;
  participantCount?: number;
}

interface FilterItem {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  type: "select" | "multi";
  defaultValue: string | string[];
}

export default function EventsPage() {
  const defaultFilters = {
    status: "all",
    register_by: { from: "", to: "" },
  };
  const { data: session, status } = useSession();
  const { request, loading, error } = useApi();
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useTranslation("home");

  const fetchData = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }
    const evRes = await request<{ events: EventItem[] }>({
      url: "/api/events",
      method: "get",
    });
    setEvents(evRes.events);
    setAllEvents(evRes.events);
    if (refresh) {
      setRefreshing(false);
    } else {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchData();
  }, [status, request]);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.classList.add("scrollbar-hide");
    }

    return () => {
      if (mainEl) {
        mainEl.classList.remove("scrollbar-hide");
      }
    };
  }, []);

  useEffect(() => {
    const result = allEvents.filter((item) => {
      const eventDate = new Date(item.registrationEndTime || item.createdAt);

      return (
        (filters.status === "all" || item.status === filters.status) &&
        (!filters.register_by.from ||
          eventDate >= new Date(filters.register_by.from)) &&
        (!filters.register_by.to ||
          eventDate <= new Date(filters.register_by.to))
      );
    });

    setEvents(result);
  }, [filters, allEvents]);

  if (status === "loading" || initialLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <div className="p-4">{t("loadError")}</div>;
  }

  const handleFilterChange = (selected: Record<string, any>) => {
    setFilters(selected);
  };

  const emptyComponent = <div className="p-4">{t("noEvents")}</div>;
  const filterOptions = [
    {
      key: "status",
      label: t("Status"),
      options: [
        {
          label: t("all"),
          value: "all",
        },
        {
          label: t("preparing"),
          value: "preparing",
        },
        {
          label: t("registration"),
          value: "registration",
        },
        {
          label: t("arranging"),
          value: "arranging",
        },
        {
          label: t("running"),
          value: "running",
        },
        {
          label: t("ended"),
          value: "ended",
        },
      ],
      type: "select",
      defaultValue: "all",
    },
    {
      key: "register_by",
      label: "Date",
      type: "daterange",
      defaultValue: { from: "", to: "" },
    },
  ];

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <PullToRefreshWrapper onRefresh={() => fetchData(true)}>
        <div className="space-y-4">
          <h1 className="text-2xl mb-2">{t("availableEvents")}</h1>
          <div className="flex justify-between md:justify-start gap-4">
            {events.length > 0 && (
              <Input
                placeholder={t("searchEvents")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            )}
            <FilterBar
              filters={filterOptions as FilterItem[]}
              onChange={handleFilterChange}
            />
          </div>

          <div className="flex flex-col h-screen">
            <div className="flex-1 pb-[10px]">
              <VirtualResponsiveGrid
                data={filteredEvents}
                emptyComponent={emptyComponent}
                renderItem={(item) => (
                  <Link
                    key={item.id}
                    href={`/events/${item.id}`}
                    className="block"
                  >
                    <EventCard event={item} />
                  </Link>
                )}
                gap="gap-4"
              />
            </div>
          </div>
        </div>
      </PullToRefreshWrapper>
    </div>
  );
}
