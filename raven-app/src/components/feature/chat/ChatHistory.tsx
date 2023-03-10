import { Box, Spinner, Stack } from "@chakra-ui/react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { useFrappeEventListener } from "../../../hooks/useFrappeEventListener"
import { Message } from "../../../types/Messaging/Message"
import { AlertBanner } from "../../layout/AlertBanner"
import { ChatMessage } from "./ChatMessage"

interface ChatHistoryProps {
    channelName: string
}

export const ChatHistory = ({ channelName }: ChatHistoryProps) => {

    useFrappeEventListener('message_deleted', (data) => {
        if (data.channel_id === channelName) {
            mutate()
        }
    })

    useFrappeEventListener('message_updated', (data) => {
        if (data.channel_id === channelName) {
            mutate()
        }
    })
    const [limit, setLimit] = useState(10)
    const { data, error, mutate, isLoading } = useFrappeGetDocList<Message>('Raven Message', {
        fields: ["text", "creation", "name", "owner", "message_type", "file"],
        filters: [["channel_id", "=", channelName ?? null]],
        orderBy: {
            field: "creation",
            order: 'desc'
        },
        limit: limit
    })

    const [hasMore, setHasMore] = useState(true)

    const handleScroll = () => {
        if (data?.length == limit) {
            setLimit((prev) => prev + 10)
            mutate()
        }
        else {
            setHasMore(false)
        }
    }

    if (error) {
        return (
            <Box p={4}>
                <AlertBanner status='error' heading={error.message}>{error.httpStatus}: {error.httpStatusText}</AlertBanner>
            </Box>
        )
    }

    return (
        <Stack id="scrollableDiv" spacing={4} justify='end' overflow='auto' display='flex' flexDirection='column-reverse' overflow-anchor='none'>
            {data &&
                <InfiniteScroll
                    dataLength={data.length}
                    next={handleScroll}
                    style={{ display: 'flex', flexDirection: 'column-reverse', overflowAnchor: 'none' }}
                    inverse={true}
                    hasMore={hasMore}
                    loader={<Spinner />}
                    scrollableTarget="scrollableDiv"
                    endMessage="no more messages"
                >
                    {data.map((message) => {
                        if (message.message_type === 'Text') {
                            return <ChatMessage
                                key={message.name}
                                name={message.name}
                                text={message.text}
                                user={message.owner}
                                timestamp={new Date(message.creation)} />
                        } else if (message.message_type === 'File') {
                            return <ChatMessage
                                key={message.name}
                                name={message.name}
                                file={message.file}
                                user={message.owner}
                                timestamp={new Date(message.creation)} />
                        } else if (message.message_type === 'Image') {
                            return <ChatMessage
                                key={message.name}
                                name={message.name}
                                image={message.file}
                                user={message.owner}
                                timestamp={new Date(message.creation)} />
                        }
                    })}
                </InfiniteScroll>}
        </Stack >
    )
}