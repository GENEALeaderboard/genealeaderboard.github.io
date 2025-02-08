import CircleLoading from "@/icons/circleloading"
import { memo } from "react"

const VideoList = memo(function VideoList({ videos, videosLoading }) {
  if (videosLoading) {
    return (
      <div className="w-full px-12  justify-center">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Loading ...
        </p>
      </div>
    )
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b py-4 text-left dark:border-neutral-700 ">
          <th className="py-2 pl-4 font-semibold">#ID</th>
          <th className="py-2 pl-4 font-semibold">Input Code</th>
          <th className="py-2 pl-4 font-semibold">Video Path</th>
          <th className="py-2 pl-4 font-semibold">Video</th>
          <th className="py-2 pl-4 font-semibold">System Name</th>
          <th className="py-2 pl-4 font-semibold">Created time</th>
        </tr>
      </thead>
      <tbody className="align-baseline text-gray-900 dark:text-gray-100">
        {videos &&
          videos.map((video, index) => (
            <tr key={index} className="border-b border-gray-100 dark:border-neutral-700/50 align-middle">
              <td className="py-2 pl-4">{index + 1}</td>
              <td className="py-2 pl-4">
                <div className="max-w-28">
                  <code>{video.inputcode}</code>
                </div>
              </td>
              <td className="py-2 pl-4">
                <div className="overflow-x-auto overflow-y-hidden max-w-60 py-4">
                  <code className="w-96 h-4">{video.path}</code>
                </div>
              </td>
              <td className="py-2 pl-4 font-bold">
                <video controls className={"rounded-xl border h-40 w-40"}>
                  <source src={video.url} type="video/mp4" />
                </video>
              </td>
              <td className="py-2 pl-4 h-14">{video.systemname}</td>
              <td className="py-2 pl-4">
                <p className="truncate w-20">{new Date(video.createdat).toLocaleString()}</p>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )
})

export default VideoList
